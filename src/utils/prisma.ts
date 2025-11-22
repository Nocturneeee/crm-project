// File: src/utils/prisma.ts

// PASTIKAN import ini menuju ke lokasi output di schema.prisma
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['error'],
  errorFormat: 'minimal'
})

export default prisma
