-- CreateTable
CREATE TABLE "PantryShelf" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PantryShelf_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pantryItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shelfId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pantryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "pantryItem" ADD CONSTRAINT "pantryItem_shelfId_fkey" FOREIGN KEY ("shelfId") REFERENCES "PantryShelf"("id") ON DELETE CASCADE ON UPDATE CASCADE;
