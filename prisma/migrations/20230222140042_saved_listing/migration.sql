/*
  Warnings:

  - You are about to drop the `ListingInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ListingInfo";

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSavedProperty" (
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSavedProperty_pkey" PRIMARY KEY ("propertyId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Property_id_clusterId_key" ON "Property"("id", "clusterId");

-- AddForeignKey
ALTER TABLE "UserSavedProperty" ADD CONSTRAINT "UserSavedProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSavedProperty" ADD CONSTRAINT "UserSavedProperty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
