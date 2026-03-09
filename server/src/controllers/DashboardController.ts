import type { Request, Response } from "express";
import { sendResponse } from "../utils/sendResponse.js";
import prisma from "../config/db.config.js";
import { InvoiceStatus } from "@prisma/client";

const toNumber = (value: unknown) => Number(value ?? 0);

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const toMonthKey = (date: Date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;

const toMonthLabel = (date: Date) =>
  date.toLocaleString("en-US", { month: "short", year: "numeric" });

const startOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};

const buildDateSeries = (start: Date, days: number) => {
  const series: string[] = [];
  for (let i = 0; i < days; i += 1) {
    series.push(toDateKey(addDays(start, i)));
  }
  return series;
};

const dayOfWeekKey = (date: Date) => date.getUTCDay();

const percentChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }
  return ((current - previous) / previous) * 100;
};

class DashboardController {
  static async overview(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const startCurrent = startOfDayUtc(addDays(now, -29));
    const startPrevious = startOfDayUtc(addDays(now, -59));
    const endPrevious = startOfDayUtc(addDays(now, -30));

    const [
      paymentTotals,
      saleTotals,
      purchaseTotals,
      receivablesTotals,
      products,
      invoiceCounts,
      overdueInvoices,
      recentInvoices,
      recentSales,
      recentPurchases,
      currentSales,
      previousSales,
      currentPurchases,
      previousPurchases,
      currentPayments,
      previousPayments,
      currentReceivables,
      previousReceivables,
    ] = await Promise.all([
      prisma.payment.aggregate({
        where: { user_id: userId },
        _sum: { amount: true },
      }),
      prisma.sale.aggregate({
        where: { user_id: userId },
        _sum: { total: true },
      }),
      prisma.purchase.aggregate({
        where: { user_id: userId },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          user_id: userId,
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { total: true },
      }),
      prisma.product.findMany({
        where: { user_id: userId },
        select: {
          name: true,
          stock_on_hand: true,
          reorder_level: true,
          price: true,
          cost: true,
        },
      }),
      prisma.invoice.groupBy({
        by: ["status"],
        where: { user_id: userId },
        _count: { id: true },
      }),
      prisma.invoice.findMany({
        where: { user_id: userId, status: InvoiceStatus.OVERDUE },
        select: { invoice_number: true },
        take: 5,
        orderBy: { date: "desc" },
      }),
      prisma.invoice.findMany({
        where: { user_id: userId },
        select: { invoice_number: true, date: true, total: true },
        orderBy: { date: "desc" },
        take: 4,
      }),
      prisma.sale.findMany({
        where: { user_id: userId },
        select: { id: true, sale_date: true, total: true },
        orderBy: { sale_date: "desc" },
        take: 4,
      }),
      prisma.purchase.findMany({
        where: { user_id: userId },
        select: { id: true, purchase_date: true, total: true },
        orderBy: { purchase_date: "desc" },
        take: 4,
      }),
      prisma.sale.aggregate({
        where: { user_id: userId, sale_date: { gte: startCurrent } },
        _sum: { total: true },
      }),
      prisma.sale.aggregate({
        where: {
          user_id: userId,
          sale_date: { gte: startPrevious, lt: endPrevious },
        },
        _sum: { total: true },
      }),
      prisma.purchase.aggregate({
        where: { user_id: userId, purchase_date: { gte: startCurrent } },
        _sum: { total: true },
      }),
      prisma.purchase.aggregate({
        where: {
          user_id: userId,
          purchase_date: { gte: startPrevious, lt: endPrevious },
        },
        _sum: { total: true },
      }),
      prisma.payment.aggregate({
        where: { user_id: userId, paid_at: { gte: startCurrent } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: {
          user_id: userId,
          paid_at: { gte: startPrevious, lt: endPrevious },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          user_id: userId,
          date: { gte: startCurrent },
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          user_id: userId,
          date: { gte: startPrevious, lt: endPrevious },
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { total: true },
      }),
    ]);

    const totalRevenue = toNumber(paymentTotals._sum.amount);
    const totalSales = toNumber(saleTotals._sum.total);
    const totalPurchases = toNumber(purchaseTotals._sum.total);
    const receivables = toNumber(receivablesTotals._sum.total);
    const payables = totalPurchases;

    const inventoryValue = products.reduce((sum, product) => {
      const unit = toNumber(product.cost ?? product.price);
      return sum + unit * product.stock_on_hand;
    }, 0);

    const lowStockProducts = products.filter(
      (product) => product.stock_on_hand <= product.reorder_level,
    );

    const currentSalesValue = toNumber(currentSales._sum.total);
    const previousSalesValue = toNumber(previousSales._sum.total);
    const currentPurchasesValue = toNumber(currentPurchases._sum.total);
    const previousPurchasesValue = toNumber(previousPurchases._sum.total);
    const currentPaymentsValue = toNumber(currentPayments._sum.amount);
    const previousPaymentsValue = toNumber(previousPayments._sum.amount);
    const currentReceivablesValue = toNumber(currentReceivables._sum.total);
    const previousReceivablesValue = toNumber(previousReceivables._sum.total);

    const invoiceStats = invoiceCounts.reduce(
      (acc, item) => {
        acc.total += item._count.id;
        if (item.status === InvoiceStatus.PAID) {
          acc.paid += item._count.id;
        } else if (
          item.status === InvoiceStatus.SENT ||
          item.status === InvoiceStatus.PARTIALLY_PAID
        ) {
          acc.pending += item._count.id;
        } else if (item.status === InvoiceStatus.OVERDUE) {
          acc.overdue += item._count.id;
        }
        return acc;
      },
      { total: 0, paid: 0, pending: 0, overdue: 0 },
    );

    const activity = [
      ...recentInvoices.map((invoice) => ({
        time: invoice.date,
        label: `Invoice ${invoice.invoice_number} issued`,
      })),
      ...recentSales.map((sale) => ({
        time: sale.sale_date,
        label: `Sale #${sale.id} recorded`,
      })),
      ...recentPurchases.map((purchase) => ({
        time: purchase.purchase_date,
        label: `Purchase #${purchase.id} added`,
      })),
    ]
      .sort((a, b) => b.time.getTime() - a.time.getTime())
      .slice(0, 6)
      .map((item) => ({
        time: item.time.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        label: item.label,
      }));

    return sendResponse(res, 200, {
      data: {
        metrics: {
          totalRevenue,
          totalSales,
          totalPurchases,
          receivables,
          payables,
          inventoryValue,
          changes: {
            totalRevenue: percentChange(
              currentPaymentsValue,
              previousPaymentsValue,
            ),
            totalSales: percentChange(currentSalesValue, previousSalesValue),
            totalPurchases: percentChange(
              currentPurchasesValue,
              previousPurchasesValue,
            ),
            receivables: percentChange(
              currentReceivablesValue,
              previousReceivablesValue,
            ),
            payables: percentChange(
              currentPurchasesValue,
              previousPurchasesValue,
            ),
            inventoryValue: 0,
          },
        },
        invoiceStats,
        alerts: {
          lowStock: lowStockProducts
            .slice(0, 6)
            .map((item) => `${item.name} (${item.stock_on_hand})`),
          overdueInvoices: overdueInvoices.map((item) => item.invoice_number),
          supplierPayables: [],
        },
        activity,
      },
    });
  }

  static async sales(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const start30 = startOfDayUtc(addDays(now, -29));
    const start7 = startOfDayUtc(addDays(now, -6));
    const start6Months = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
    );

    const [sales, purchases, saleItems] = await Promise.all([
      prisma.sale.findMany({
        where: { user_id: userId, sale_date: { gte: start30 } },
        select: { sale_date: true, total: true },
      }),
      prisma.purchase.findMany({
        where: { user_id: userId, purchase_date: { gte: start6Months } },
        select: { purchase_date: true, total: true },
      }),
      prisma.saleItem.findMany({
        where: { sale: { user_id: userId, sale_date: { gte: start30 } } },
        select: {
          line_total: true,
          product: { select: { category: { select: { name: true } } } },
        },
      }),
    ]);

    const dailyTotals = new Map<string, number>();
    sales.forEach((sale) => {
      const key = toDateKey(sale.sale_date);
      dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + toNumber(sale.total));
    });

    const last30Days = buildDateSeries(start30, 30).map((key) => ({
      date: key,
      sales: dailyTotals.get(key) ?? 0,
    }));

    const last7Days = buildDateSeries(start7, 7).map((key) => ({
      date: key,
      sales: dailyTotals.get(key) ?? 0,
    }));

    const monthlyMap = new Map<
      string,
      { sales: number; purchases: number; labelDate: Date }
    >();
    for (let i = 0; i < 6; i += 1) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1),
      );
      monthlyMap.set(toMonthKey(date), {
        sales: 0,
        purchases: 0,
        labelDate: date,
      });
    }

    sales.forEach((sale) => {
      const key = toMonthKey(sale.sale_date);
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.sales += toNumber(sale.total);
      }
    });

    purchases.forEach((purchase) => {
      const key = toMonthKey(purchase.purchase_date);
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.purchases += toNumber(purchase.total);
      }
    });

    const monthly = Array.from(monthlyMap.values()).map((entry) => ({
      month: toMonthLabel(entry.labelDate),
      sales: entry.sales,
      purchases: entry.purchases,
    }));

    const categoryMap = new Map<string, number>();
    saleItems.forEach((item) => {
      const name = item.product?.category?.name ?? "Uncategorized";
      categoryMap.set(
        name,
        (categoryMap.get(name) ?? 0) + toNumber(item.line_total),
      );
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    return sendResponse(res, 200, {
      data: {
        last7Days,
        last30Days,
        monthly,
        categories,
      },
    });
  }

  static async inventory(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const start30 = startOfDayUtc(addDays(now, -29));

    const [totalProducts, products, saleItems] = await Promise.all([
      prisma.product.count({ where: { user_id: userId } }),
      prisma.product.findMany({
        where: { user_id: userId },
        select: {
          name: true,
          stock_on_hand: true,
          reorder_level: true,
          cost: true,
          price: true,
        },
      }),
      prisma.saleItem.findMany({
        where: { sale: { user_id: userId, sale_date: { gte: start30 } } },
        select: { quantity: true, name: true },
      }),
    ]);

    const inventoryValue = products.reduce((sum, product) => {
      const unit = toNumber(product.cost ?? product.price);
      return sum + unit * product.stock_on_hand;
    }, 0);

    const lowStockProducts = products.filter(
      (product) => product.stock_on_hand <= product.reorder_level,
    );
    const outOfStock = products.filter(
      (product) => product.stock_on_hand === 0,
    ).length;
    const lowStock = lowStockProducts.length;

    const salesMap = new Map<string, number>();
    saleItems.forEach((item) => {
      salesMap.set(item.name, (salesMap.get(item.name) ?? 0) + item.quantity);
    });

    const topSellingEntry = Array.from(salesMap.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return sendResponse(res, 200, {
      data: {
        totalProducts,
        lowStock,
        outOfStock,
        inventoryValue,
        topSelling: topSellingEntry
          ? { name: topSellingEntry[0], units: topSellingEntry[1] }
          : null,
        lowStockItems: lowStockProducts
          .sort((a, b) => a.stock_on_hand - b.stock_on_hand)
          .slice(0, 6)
          .map((item) => ({
            name: item.name,
            stock: item.stock_on_hand,
            reorder: item.reorder_level,
          })),
      },
    });
  }

  static async transactions(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const invoices = await prisma.invoice.findMany({
      where: { user_id: userId },
      include: { customer: true },
      orderBy: { date: "desc" },
      take: 10,
    });

    const transactions = invoices.map((invoice) => ({
      date: invoice.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      invoiceNumber: invoice.invoice_number,
      customer: invoice.customer?.name ?? "Customer",
      amount: toNumber(invoice.total),
      status: invoice.status.replace("_", " "),
    }));

    return sendResponse(res, 200, { data: { transactions } });
  }

  static async customers(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const [total, receivableInvoices, topInvoices] = await Promise.all([
      prisma.customer.count({ where: { user_id: userId } }),
      prisma.invoice.aggregate({
        where: {
          user_id: userId,
          status: {
            in: [
              InvoiceStatus.SENT,
              InvoiceStatus.PARTIALLY_PAID,
              InvoiceStatus.OVERDUE,
            ],
          },
        },
        _sum: { total: true },
      }),
      prisma.invoice.groupBy({
        by: ["customer_id"],
        where: { user_id: userId },
        _sum: { total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
    ]);

    const customers = await prisma.customer.findMany({
      where: { id: { in: topInvoices.map((item) => item.customer_id) } },
      select: { id: true, name: true },
    });

    const customerMap = new Map(
      customers.map((customer) => [customer.id, customer.name]),
    );

    const topCustomers = topInvoices.map((item) => ({
      name: customerMap.get(item.customer_id) ?? "Customer",
      total: toNumber(item._sum.total),
    }));

    return sendResponse(res, 200, {
      data: {
        total,
        pendingPayments: toNumber(receivableInvoices._sum.total),
        topCustomers,
      },
    });
  }

  static async suppliers(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const start30 = startOfDayUtc(addDays(now, -29));

    const [total, recentPurchases, purchaseTotals] = await Promise.all([
      prisma.supplier.count({ where: { user_id: userId } }),
      prisma.purchase.count({
        where: { user_id: userId, purchase_date: { gte: start30 } },
      }),
      prisma.purchase.aggregate({
        where: { user_id: userId, purchase_date: { gte: start30 } },
        _sum: { total: true },
      }),
    ]);

    return sendResponse(res, 200, {
      data: {
        total,
        recentPurchases,
        outstandingPayables: toNumber(purchaseTotals._sum.total),
      },
    });
  }

  static async cashflow(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const start30 = startOfDayUtc(addDays(now, -29));

    const [payments, purchases] = await Promise.all([
      prisma.payment.findMany({
        where: { user_id: userId, paid_at: { gte: start30 } },
        select: { paid_at: true, amount: true },
      }),
      prisma.purchase.findMany({
        where: { user_id: userId, purchase_date: { gte: start30 } },
        select: { purchase_date: true, total: true },
      }),
    ]);

    const inflowMap = new Map<string, number>();
    payments.forEach((payment) => {
      const key = toDateKey(payment.paid_at);
      inflowMap.set(key, (inflowMap.get(key) ?? 0) + toNumber(payment.amount));
    });

    const outflowMap = new Map<string, number>();
    purchases.forEach((purchase) => {
      const key = toDateKey(purchase.purchase_date);
      outflowMap.set(
        key,
        (outflowMap.get(key) ?? 0) + toNumber(purchase.total),
      );
    });

    const series = buildDateSeries(start30, 30).map((key) => ({
      date: key,
      inflow: inflowMap.get(key) ?? 0,
      outflow: outflowMap.get(key) ?? 0,
    }));

    const inflow = series.reduce((sum, item) => sum + item.inflow, 0);
    const outflow = series.reduce((sum, item) => sum + item.outflow, 0);

    return sendResponse(res, 200, {
      data: {
        inflow,
        outflow,
        net: inflow - outflow,
        series,
      },
    });
  }

  static async forecast(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
      return sendResponse(res, 401, { message: "Unauthorized" });
    }

    const now = new Date();
    const start56 = startOfDayUtc(addDays(now, -55));
    const start30 = startOfDayUtc(addDays(now, -29));
    const start6Months = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
    );

    const [sales, purchases] = await Promise.all([
      prisma.sale.findMany({
        where: { user_id: userId, sale_date: { gte: start56 } },
        select: { sale_date: true, total: true },
      }),
      prisma.purchase.findMany({
        where: { user_id: userId, purchase_date: { gte: start56 } },
        select: { purchase_date: true, total: true },
      }),
    ]);

    const salesByDate = new Map<string, number>();
    sales.forEach((sale) => {
      const key = toDateKey(sale.sale_date);
      salesByDate.set(key, (salesByDate.get(key) ?? 0) + toNumber(sale.total));
    });

    const purchasesByDate = new Map<string, number>();
    purchases.forEach((purchase) => {
      const key = toDateKey(purchase.purchase_date);
      purchasesByDate.set(
        key,
        (purchasesByDate.get(key) ?? 0) + toNumber(purchase.total),
      );
    });

    const last30 = buildDateSeries(start30, 30).map((key) => {
      const revenue = salesByDate.get(key) ?? 0;
      const cost = purchasesByDate.get(key) ?? 0;
      return { date: key, revenue, cost, profit: revenue - cost };
    });

    const monthlyMap = new Map<
      string,
      { revenue: number; cost: number; labelDate: Date }
    >();
    for (let i = 0; i < 6; i += 1) {
      const date = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1),
      );
      monthlyMap.set(toMonthKey(date), {
        revenue: 0,
        cost: 0,
        labelDate: date,
      });
    }

    sales.forEach((sale) => {
      if (sale.sale_date < start6Months) {
        return;
      }
      const key = toMonthKey(sale.sale_date);
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.revenue += toNumber(sale.total);
      }
    });

    purchases.forEach((purchase) => {
      if (purchase.purchase_date < start6Months) {
        return;
      }
      const key = toMonthKey(purchase.purchase_date);
      const entry = monthlyMap.get(key);
      if (entry) {
        entry.cost += toNumber(purchase.total);
      }
    });

    const monthly = Array.from(monthlyMap.values()).map((entry) => {
      const profit = entry.revenue - entry.cost;
      const margin = entry.revenue === 0 ? 0 : (profit / entry.revenue) * 100;
      return {
        month: toMonthLabel(entry.labelDate),
        profit,
        margin,
      };
    });

    const salesByDow = new Map<number, { total: number; count: number }>();
    for (let i = 0; i < 7; i += 1) {
      salesByDow.set(i, { total: 0, count: 0 });
    }

    sales.forEach((sale) => {
      const dayKey = dayOfWeekKey(sale.sale_date);
      const bucket = salesByDow.get(dayKey);
      if (bucket) {
        bucket.total += toNumber(sale.total);
        bucket.count += 1;
      }
    });

    const avgByDow = new Map<number, number>();
    salesByDow.forEach((bucket, key) => {
      avgByDow.set(key, bucket.count === 0 ? 0 : bucket.total / bucket.count);
    });

    const next14Days = buildDateSeries(startOfDayUtc(addDays(now, 1)), 14).map(
      (key) => {
        const date = new Date(key);
        const forecast = avgByDow.get(dayOfWeekKey(date)) ?? 0;
        return { date: key, forecast };
      },
    );

    return sendResponse(res, 200, {
      data: {
        profit: { monthly, last30 },
        forecast: {
          method: "seasonal-dow-8w",
          next14Days,
        },
      },
    });
  }
}

export default DashboardController;
