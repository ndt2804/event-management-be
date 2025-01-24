export interface JwtPayload {
  id: string; // id là kiểu string, vì trong Prisma id là String
  email: string;
  role: string;
}
