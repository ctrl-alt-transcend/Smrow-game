-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "writedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
