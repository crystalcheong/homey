-- CreateTable
CREATE TABLE "ListingInfo" (
    "id" TEXT NOT NULL,
    "clusterId" TEXT NOT NULL,

    CONSTRAINT "ListingInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingInfo_id_clusterId_key" ON "ListingInfo"("id", "clusterId");
