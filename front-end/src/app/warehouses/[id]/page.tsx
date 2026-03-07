import { getServerSession } from "next-auth";
import {
  authOptions,
  CustomSession,
} from "../../api/auth/[...nextauth]/options";
import WarehouseDetailClient from "./WarehouseDetailClient";

const WarehouseDetailPage = async ({ params }: { params: { id: string } }) => {
  const session: CustomSession | null = await getServerSession(authOptions);
  const name = session?.user?.name || "Guest";
  const warehouseId = Number(params.id);

  return (
    <WarehouseDetailClient
      name={name}
      image={session?.user?.image || undefined}
      warehouseId={warehouseId}
    />
  );
};

export default WarehouseDetailPage;
