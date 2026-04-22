-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "netlifyToken" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradingName" TEXT,
    "taxIdType" TEXT NOT NULL,
    "taxIdNumber" TEXT NOT NULL,
    "vatNumber" TEXT,
    "addressStreet" TEXT NOT NULL,
    "addressNumber" TEXT NOT NULL,
    "addressComplement" TEXT,
    "addressDistrict" TEXT NOT NULL,
    "addressCity" TEXT NOT NULL,
    "addressState" TEXT,
    "addressZip" TEXT NOT NULL,
    "addressCountry" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "supportEmail" TEXT,
    "legalRepName" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "briefSummary" TEXT NOT NULL,
    "priceGross" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "guaranteeDays" INTEGER NOT NULL,
    "hasUpsell" BOOLEAN NOT NULL DEFAULT false,
    "hasSubscription" BOOLEAN NOT NULL DEFAULT false,
    "checkoutUrl" TEXT,
    "generatedCopy" TEXT,
    "generatedHtml" TEXT,
    "netlifyUrl" TEXT,
    "netlifyDeployId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyProfile_userId_key" ON "CompanyProfile"("userId");
