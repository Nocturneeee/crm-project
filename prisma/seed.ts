import { PrismaClient, LeadStatus, LeadSource } from '@prisma/client'; // Tambah import enum
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Data roles standar untuk CRM
const roleData = [
  { name: 'ADMIN' },
  { name: 'SALES' },
  { name: 'LEAD' },
];

// Data leads dengan berbagai status
const leadsData = [
  // LEAD_IN status
  {
    name: '[Sample] Table',
    company: 'Company Name',
    email: 'contact@company.com',
    phone: '081234567890',
    status: LeadStatus.LEAD_IN, // Gunakan enum
    value: 30000000,
    priority: 'High',
    source: LeadSource.WEBSITE, // Gunakan enum
  },
  {
    name: '[Sample] Table',
    company: 'Company Name 2',
    email: 'contact2@company.com',
    phone: '082234567890',
    status: LeadStatus.LEAD_IN,
    value: 0,
    priority: 'Medium',
    source: LeadSource.ADS_CAMPAIGN,
  },
  // CONTACT_MADE status
  {
    name: 'Contact Made Lead',
    company: 'Company Contact',
    email: 'contact@contact.com',
    phone: '083234567890',
    status: LeadStatus.CONTACT_MADE,
    value: 0,
    priority: 'Medium',
    source: LeadSource.REFERRAL,
  },
  // NEED_IDENTIFIED status
  {
    name: '[Sample] Table',
    company: 'Company Name',
    email: 'need@company.com',
    phone: '084234567890',
    status: LeadStatus.NEED_IDENTIFIED,
    value: 30000000,
    priority: 'High',
    source: LeadSource.EVENT_OFFLINE,
  },
  {
    name: '[Sample] Table',
    company: 'Company Name 3',
    email: 'need2@company.com',
    phone: '085234567890',
    status: LeadStatus.NEED_IDENTIFIED,
    value: 25000000,
    priority: 'High',
    source: LeadSource.SOCIAL_MEDIA,
  },
  // PROPOSAL_MADE status
  {
    name: '[Sample] Table',
    company: 'Company Name',
    email: 'proposal@company.com',
    phone: '086234567890',
    status: LeadStatus.PROPOSAL_MADE,
    value: 30000000,
    priority: 'High',
    source: LeadSource.WEBSITE,
  },
  // WON status
  {
    name: '[Sample] Table',
    company: 'Company Name Won',
    email: 'won@company.com',
    phone: '087234567890',
    status: LeadStatus.WON,
    value: 50000000,
    priority: 'High',
    source: LeadSource.REFERRAL,
  },
  // LOST status
  {
    name: '[Sample] Table',
    company: 'Company Name Lost',
    email: 'lost@company.com',
    phone: '088234567890',
    status: LeadStatus.LOST,
    value: 20000000,
    priority: 'Low',
    source: LeadSource.ADS_CAMPAIGN,
  },
];

async function main() {
  console.log('Start seeding roles...');
  
  for (const r of roleData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r,
    });
    console.log(`Created or updated role with ID: ${role.id} and Name: ${role.name}`);
  }

  console.log('Start seeding users...');
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const salesRole = await prisma.role.findUnique({ where: { name: 'SALES' } });

  if (adminRole && salesRole) {
    // Admin user
    const adminPassword = await bcrypt.hash('PasswordTest123', 10);
    const adminUser = await prisma.user.upsert({
      where: { email: 'superadmin@crm.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'superadmin@crm.com',
        password: adminPassword,
        roleId: adminRole.id,
      },
    });
    console.log(`Created or updated admin user with ID: ${adminUser.id}`);

    // Sales user
    const salesPassword = await bcrypt.hash('PasswordTest123', 10);
    const salesUser = await prisma.user.upsert({
      where: { email: 'sales@crm.com' },
      update: {},
      create: {
        name: 'Sales Team',
        email: 'sales@crm.com',
        password: salesPassword,
        roleId: salesRole.id,
      },
    });
    console.log(`Created or updated sales user with ID: ${salesUser.id}`);

    console.log('Start seeding leads...');
    for (const lead of leadsData) {
      const createdLead = await prisma.lead.create({
        data: {
          ...lead,
          ownerId: adminUser.id, // Assign ke admin user
        },
      });
      console.log(`Created lead with ID: ${createdLead.id} and status: ${createdLead.status}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
