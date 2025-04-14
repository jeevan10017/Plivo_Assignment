-- CreateTable
CREATE TABLE "ServiceStatusHistory" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "status" "ServiceStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,

    CONSTRAINT "ServiceStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceStatusHistory_serviceId_idx" ON "ServiceStatusHistory"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceStatusHistory_createdAt_idx" ON "ServiceStatusHistory"("createdAt");

-- AddForeignKey
ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceStatusHistory" ADD CONSTRAINT "ServiceStatusHistory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
