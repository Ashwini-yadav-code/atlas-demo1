-- CreateTable
CREATE TABLE "PartnerClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PartnerClick_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "ServicePartner" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PartnerClick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
