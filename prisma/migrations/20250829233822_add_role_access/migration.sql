-- CreateTable
CREATE TABLE "RoleAccess" (
    "id" TEXT NOT NULL,
    "menu" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "RoleAccess_pkey" PRIMARY KEY ("id")
);
