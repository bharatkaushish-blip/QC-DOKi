// To configure in package.json:
//   "prisma": { "seed": "tsx prisma/seed.ts" }

import { PrismaClient, FieldType, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ─── TYPES ──────────────────────────────────────────

interface FieldDef {
  name: string;
  labelEn: string;
  labelHi: string;
  fieldType: FieldType;
  unit?: string;
  minValue?: number;
  maxValue?: number;
  required: boolean;
}

interface StageDef {
  name: string;
  order: number;
  isQcGate: boolean;
  fields: FieldDef[];
}

// ─── FIELD DEFINITIONS ──────────────────────────────

const rawMaterialIntakeFields: FieldDef[] = [
  { name: 'supplier_name', labelEn: 'Supplier Name', labelHi: 'आपूर्तिकर्ता का नाम', fieldType: FieldType.TEXT, required: true },
  { name: 'lot_number', labelEn: 'Lot Number', labelHi: 'लॉट नंबर', fieldType: FieldType.TEXT, required: true },
  { name: 'weight_received', labelEn: 'Weight Received', labelHi: 'प्राप्त वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'date_received', labelEn: 'Date Received', labelHi: 'प्राप्ति तिथि', fieldType: FieldType.DATETIME, required: true },
  { name: 'visual_inspection', labelEn: 'Visual Inspection Pass', labelHi: 'दृश्य निरीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
];

function incomingQcFields(phMax: number): FieldDef[] {
  return [
    { name: 'smell_test', labelEn: 'Smell Test Pass', labelHi: 'गंध परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'smell_notes', labelEn: 'Smell Notes', labelHi: 'गंध टिप्पणी', fieldType: FieldType.TEXT, required: false },
    { name: 'ph_level', labelEn: 'pH Level', labelHi: 'पीएच स्तर', fieldType: FieldType.NUMBER, unit: 'pH', minValue: 0, maxValue: phMax, required: true },
    { name: 'temperature', labelEn: 'Temperature', labelHi: 'तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  ];
}

const cuttingFields: FieldDef[] = [
  { name: 'weight_before_cutting', labelEn: 'Weight Before Cutting', labelHi: 'काटने से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'weight_after_cutting', labelEn: 'Weight After Cutting', labelHi: 'काटने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'cut_type', labelEn: 'Cut Type/Size', labelHi: 'कट प्रकार/आकार', fieldType: FieldType.TEXT, required: true },
  { name: 'operator_name', labelEn: 'Operator Name', labelHi: 'ऑपरेटर का नाम', fieldType: FieldType.TEXT, required: true },
];

const marinationFields: FieldDef[] = [
  { name: 'weight_pre_marination', labelEn: 'Weight Pre-Marination', labelHi: 'मैरिनेशन से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'marinade_recipe_batch', labelEn: 'Marinade Recipe/Batch', labelHi: 'मैरिनेड रेसिपी/बैच', fieldType: FieldType.TEXT, required: true },
  { name: 'marination_start_time', labelEn: 'Marination Start Time', labelHi: 'मैरिनेशन शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'marination_end_time', labelEn: 'Marination End Time', labelHi: 'मैरिनेशन समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'weight_post_marination', labelEn: 'Weight Post-Marination', labelHi: 'मैरिनेशन के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'temperature_during_marination', labelEn: 'Temperature During Marination', labelHi: 'मैरिनेशन के दौरान तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
];

const jerkyDehydrationFields: FieldDef[] = [
  { name: 'weight_pre_dehydration', labelEn: 'Weight Pre-Dehydration', labelHi: 'डिहाइड्रेशन से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'temperature_setpoint', labelEn: 'Temperature Setpoint', labelHi: 'तापमान सेटपॉइंट', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'actual_temperature', labelEn: 'Actual Temperature', labelHi: 'वास्तविक तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'humidity_setpoint', labelEn: 'Humidity Setpoint', labelHi: 'आर्द्रता सेटपॉइंट', fieldType: FieldType.NUMBER, unit: '%RH', required: true },
  { name: 'actual_humidity', labelEn: 'Actual Humidity', labelHi: 'वास्तविक आर्द्रता', fieldType: FieldType.NUMBER, unit: '%RH', required: true },
  { name: 'start_time', labelEn: 'Start Time', labelHi: 'शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'end_time', labelEn: 'End Time', labelHi: 'समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'weight_post_dehydration', labelEn: 'Weight Post-Dehydration', labelHi: 'डिहाइड्रेशन के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

function jerkyFinalQcFields(): FieldDef[] {
  return [
    { name: 'water_activity', labelEn: 'Water Activity (Aw)', labelHi: 'जल गतिविधि', fieldType: FieldType.NUMBER, unit: 'Aw', minValue: 0, maxValue: 0.80, required: true },
    { name: 'taste_test', labelEn: 'Taste Test Pass', labelHi: 'स्वाद परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'taste_notes', labelEn: 'Taste Notes', labelHi: 'स्वाद टिप्पणी', fieldType: FieldType.TEXT, required: false },
    { name: 'taste_tester_name', labelEn: 'Taste Tester Name', labelHi: 'स्वाद परीक्षक का नाम', fieldType: FieldType.TEXT, required: true },
    { name: 'texture_test', labelEn: 'Texture Test Pass', labelHi: 'बनावट परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'texture_notes', labelEn: 'Texture Notes', labelHi: 'बनावट टिप्पणी', fieldType: FieldType.TEXT, required: false },
    { name: 'texture_tester_name', labelEn: 'Texture Tester Name', labelHi: 'बनावट परीक्षक का नाम', fieldType: FieldType.TEXT, required: true },
    { name: 'visual_inspection', labelEn: 'Visual Inspection Pass', labelHi: 'दृश्य निरीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'final_weight', labelEn: 'Final Weight', labelHi: 'अंतिम वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  ];
}

const packagingFields: FieldDef[] = [
  { name: 'package_weight', labelEn: 'Package Weight', labelHi: 'पैकेज वज़न', fieldType: FieldType.NUMBER, unit: 'g', required: true },
  { name: 'package_count', labelEn: 'Package Count', labelHi: 'पैकेज गिनती', fieldType: FieldType.NUMBER, required: true },
  { name: 'label_verification', labelEn: 'Label Verification Pass', labelHi: 'लेबल सत्यापन पास', fieldType: FieldType.BOOLEAN, required: true },
  { name: 'seal_integrity', labelEn: 'Seal Integrity Pass', labelHi: 'सील अखंडता पास', fieldType: FieldType.BOOLEAN, required: true },
  { name: 'best_before_date', labelEn: 'Best Before Date', labelHi: 'सर्वोत्तम पहले तिथि', fieldType: FieldType.DATETIME, required: true },
  { name: 'batch_label_printed', labelEn: 'Batch Label Printed', labelHi: 'बैच लेबल मुद्रित', fieldType: FieldType.BOOLEAN, required: true },
];

const thawingFields: FieldDef[] = [
  { name: 'thaw_start_time', labelEn: 'Thaw Start Time', labelHi: 'पिघलाने शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'thaw_end_time', labelEn: 'Thaw End Time', labelHi: 'पिघलाने समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'temperature_start', labelEn: 'Temperature Start', labelHi: 'शुरू तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'temperature_end', labelEn: 'Temperature End', labelHi: 'अंतिम तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'weight_post_thaw', labelEn: 'Weight Post-Thaw', labelHi: 'पिघलाने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

const cuttingMincingFields: FieldDef[] = [
  { name: 'weight_pre_cut', labelEn: 'Weight Pre-Cut', labelHi: 'काटने से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'weight_post_mince', labelEn: 'Weight Post-Mince', labelHi: 'कीमा बनाने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

const doughPreparationFields: FieldDef[] = [
  { name: 'dough_recipe_batch', labelEn: 'Dough Recipe/Batch', labelHi: 'आटा रेसिपी/बैच', fieldType: FieldType.TEXT, required: true },
  { name: 'weight_of_dough', labelEn: 'Weight of Dough', labelHi: 'आटे का वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'piece_count', labelEn: 'Piece Count (approx)', labelHi: 'टुकड़ों की गिनती (अनुमानित)', fieldType: FieldType.NUMBER, required: true },
];

const boilingFields: FieldDef[] = [
  { name: 'boil_start_time', labelEn: 'Boil Start Time', labelHi: 'उबालने शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'boil_end_time', labelEn: 'Boil End Time', labelHi: 'उबालने समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'water_temperature', labelEn: 'Water Temperature', labelHi: 'पानी का तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'weight_post_boil', labelEn: 'Weight Post-Boil', labelHi: 'उबालने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

const chillingFields: FieldDef[] = [
  { name: 'chill_start_time', labelEn: 'Chill Start Time', labelHi: 'ठंडा करना शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'target_duration', labelEn: 'Target Duration', labelHi: 'लक्ष्य अवधि', fieldType: FieldType.TEXT, required: true },
  { name: 'actual_duration', labelEn: 'Actual Duration', labelHi: 'वास्तविक अवधि', fieldType: FieldType.TEXT, required: true },
  { name: 'chiller_temperature', labelEn: 'Chiller Temperature', labelHi: 'चिलर तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'weight_post_chill', labelEn: 'Weight Post-Chill', labelHi: 'ठंडा करने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

const slicingFields: FieldDef[] = [
  { name: 'weight_pre_slice', labelEn: 'Weight Pre-Slice', labelHi: 'काटने से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'slice_thickness', labelEn: 'Slice Thickness', labelHi: 'कटाई मोटाई', fieldType: FieldType.TEXT, required: true },
  { name: 'weight_post_slice', labelEn: 'Weight Post-Slice', labelHi: 'काटने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'piece_count', labelEn: 'Piece Count (approx)', labelHi: 'टुकड़ों की गिनती (अनुमानित)', fieldType: FieldType.NUMBER, required: false },
];

const chipsDehydrationFields: FieldDef[] = [
  { name: 'weight_pre_dehydration', labelEn: 'Weight Pre-Dehydration', labelHi: 'डिहाइड्रेशन से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'temperature_setpoint', labelEn: 'Temperature Setpoint', labelHi: 'तापमान सेटपॉइंट', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'actual_temperature', labelEn: 'Actual Temperature', labelHi: 'वास्तविक तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'humidity', labelEn: 'Humidity', labelHi: 'आर्द्रता', fieldType: FieldType.NUMBER, unit: '%RH', required: true },
  { name: 'start_time', labelEn: 'Start Time', labelHi: 'शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'end_time', labelEn: 'End Time', labelHi: 'समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'weight_post_dehydration', labelEn: 'Weight Post-Dehydration', labelHi: 'डिहाइड्रेशन के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

const fryingFields: FieldDef[] = [
  { name: 'oil_type', labelEn: 'Oil Type', labelHi: 'तेल का प्रकार', fieldType: FieldType.TEXT, required: true },
  { name: 'oil_temperature', labelEn: 'Oil Temperature', labelHi: 'तेल का तापमान', fieldType: FieldType.NUMBER, unit: '°C', required: true },
  { name: 'fry_start_time', labelEn: 'Fry Start Time', labelHi: 'तलने शुरू समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'fry_end_time', labelEn: 'Fry End Time', labelHi: 'तलने समाप्त समय', fieldType: FieldType.DATETIME, required: true },
  { name: 'weight_post_fry', labelEn: 'Weight Post-Fry', labelHi: 'तलने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
];

// Seasoning is added at the end on-demand per flavour order.
// At this stage only a taste/texture test is required.
const seasoningTasteTestFields: FieldDef[] = [
  { name: 'weight_pre_seasoning', labelEn: 'Weight Pre-Seasoning', labelHi: 'मसाला लगाने से पहले वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'seasoning_flavour', labelEn: 'Seasoning/Flavour Applied', labelHi: 'मसाला/स्वाद लगाया', fieldType: FieldType.TEXT, required: true },
  { name: 'seasoning_batch', labelEn: 'Seasoning Batch', labelHi: 'मसाला बैच', fieldType: FieldType.TEXT, required: true },
  { name: 'weight_post_seasoning', labelEn: 'Weight Post-Seasoning', labelHi: 'मसाला लगाने के बाद वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  { name: 'taste_test', labelEn: 'Taste Test Pass', labelHi: 'स्वाद परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
  { name: 'taste_notes', labelEn: 'Taste Notes', labelHi: 'स्वाद टिप्पणी', fieldType: FieldType.TEXT, required: false },
  { name: 'texture_test', labelEn: 'Texture Test Pass', labelHi: 'बनावट परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
  { name: 'texture_notes', labelEn: 'Texture Notes', labelHi: 'बनावट टिप्पणी', fieldType: FieldType.TEXT, required: false },
];

function chipsFinalQcFields(awMin: number, awMax: number): FieldDef[] {
  return [
    { name: 'water_activity', labelEn: 'Water Activity (Aw)', labelHi: 'जल गतिविधि', fieldType: FieldType.NUMBER, unit: 'Aw', minValue: awMin, maxValue: awMax, required: true },
    { name: 'taste_test', labelEn: 'Taste Test Pass', labelHi: 'स्वाद परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'taste_notes', labelEn: 'Taste Notes', labelHi: 'स्वाद टिप्पणी', fieldType: FieldType.TEXT, required: false },
    { name: 'taste_tester_name', labelEn: 'Taste Tester Name', labelHi: 'स्वाद परीक्षक का नाम', fieldType: FieldType.TEXT, required: true },
    { name: 'crunch_test', labelEn: 'Crunch/Texture Test Pass', labelHi: 'कुरकुरापन/बनावट परीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'crunch_notes', labelEn: 'Crunch/Texture Notes', labelHi: 'कुरकुरापन/बनावट टिप्पणी', fieldType: FieldType.TEXT, required: false },
    { name: 'visual_inspection', labelEn: 'Visual Inspection Pass', labelHi: 'दृश्य निरीक्षण पास', fieldType: FieldType.BOOLEAN, required: true },
    { name: 'final_weight', labelEn: 'Final Weight', labelHi: 'अंतिम वज़न', fieldType: FieldType.NUMBER, unit: 'kg', required: true },
  ];
}

// ─── STAGE DEFINITIONS PER PRODUCT ──────────────────

function jerkyStages(phMax: number): StageDef[] {
  return [
    { name: 'Raw Material Intake', order: 1, isQcGate: false, fields: rawMaterialIntakeFields },
    { name: 'Incoming QC', order: 2, isQcGate: true, fields: incomingQcFields(phMax) },
    { name: 'Cutting', order: 3, isQcGate: false, fields: cuttingFields },
    { name: 'Marination', order: 4, isQcGate: false, fields: marinationFields },
    { name: 'Dehydration', order: 5, isQcGate: false, fields: jerkyDehydrationFields },
    { name: 'Final QC', order: 6, isQcGate: true, fields: jerkyFinalQcFields() },
    { name: 'Packaging', order: 7, isQcGate: true, fields: packagingFields },
  ];
}

const chickenChipsStages: StageDef[] = [
  { name: 'Raw Material Intake', order: 1, isQcGate: false, fields: rawMaterialIntakeFields },
  { name: 'Thawing', order: 2, isQcGate: false, fields: thawingFields },
  { name: 'Cutting & Mincing', order: 3, isQcGate: false, fields: cuttingMincingFields },
  { name: 'Dough Preparation', order: 4, isQcGate: false, fields: doughPreparationFields },
  { name: 'Boiling', order: 5, isQcGate: false, fields: boilingFields },
  { name: 'Chilling', order: 6, isQcGate: false, fields: chillingFields },
  { name: 'Slicing', order: 7, isQcGate: false, fields: slicingFields },
  { name: 'Dehydration', order: 8, isQcGate: false, fields: chipsDehydrationFields },
  { name: 'Frying', order: 9, isQcGate: false, fields: fryingFields },
  { name: 'Seasoning & Taste Test', order: 10, isQcGate: false, fields: seasoningTasteTestFields },
  { name: 'Final QC', order: 11, isQcGate: true, fields: chipsFinalQcFields(0.20, 0.26) },
  { name: 'Packaging', order: 12, isQcGate: true, fields: packagingFields },
];

const porkPuffsStages: StageDef[] = [
  { name: 'Raw Material Intake', order: 1, isQcGate: false, fields: rawMaterialIntakeFields },
  { name: 'Thawing', order: 2, isQcGate: false, fields: thawingFields },
  { name: 'Cutting & Mincing', order: 3, isQcGate: false, fields: cuttingMincingFields },
  { name: 'Boiling', order: 4, isQcGate: false, fields: boilingFields },
  { name: 'Chilling', order: 5, isQcGate: false, fields: chillingFields },
  { name: 'Slicing', order: 6, isQcGate: false, fields: slicingFields },
  { name: 'Dehydration', order: 7, isQcGate: false, fields: chipsDehydrationFields },
  { name: 'Frying', order: 8, isQcGate: false, fields: fryingFields },
  { name: 'Seasoning & Taste Test', order: 9, isQcGate: false, fields: seasoningTasteTestFields },
  { name: 'Final QC', order: 10, isQcGate: true, fields: chipsFinalQcFields(0.38, 0.42) },
  { name: 'Packaging', order: 11, isQcGate: true, fields: packagingFields },
];

// ─── SEED FUNCTIONS ─────────────────────────────────

async function seedUsers() {
  console.log('Seeding users...');

  const adminHash = await bcrypt.hash('admin123', 12);
  const managerHash = await bcrypt.hash('manager123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@doki.com' },
    update: { name: 'DOKi Admin', passwordHash: adminHash, role: UserRole.ADMIN },
    create: { email: 'admin@doki.com', name: 'DOKi Admin', passwordHash: adminHash, role: UserRole.ADMIN },
  });

  await prisma.user.upsert({
    where: { email: 'manager@doki.com' },
    update: { name: 'DOKi Manager', passwordHash: managerHash, role: UserRole.MANAGER },
    create: { email: 'manager@doki.com', name: 'DOKi Manager', passwordHash: managerHash, role: UserRole.MANAGER },
  });

  console.log('  Users seeded.');
}

async function seedProducts() {
  console.log('Seeding products...');

  const products = [
    { name: 'Buffalo Jerky', code: 'BJ', category: 'jerky' },
    { name: 'Chicken Jerky', code: 'CJ', category: 'jerky' },
    { name: 'Chicken Chips', code: 'CC', category: 'chips' },
    { name: 'Pork Puffs', code: 'PP', category: 'puffs' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: { name: p.name, category: p.category },
      create: p,
    });
  }

  // Chicken Chips and Pork Puffs have flavour applied at seasoning stage, not at batch creation
  await prisma.product.update({ where: { code: 'CC' }, data: { flavourRequired: false } });
  await prisma.product.update({ where: { code: 'PP' }, data: { flavourRequired: false } });

  console.log('  Products seeded.');
}

async function seedFlavours() {
  console.log('Seeding flavours...');

  const bj = await prisma.product.findUniqueOrThrow({ where: { code: 'BJ' } });
  const cj = await prisma.product.findUniqueOrThrow({ where: { code: 'CJ' } });
  const cc = await prisma.product.findUniqueOrThrow({ where: { code: 'CC' } });
  const pp = await prisma.product.findUniqueOrThrow({ where: { code: 'PP' } });

  const flavourData: { productId: string; name: string; code: string }[] = [
    // Buffalo Jerky
    { productId: bj.id, name: 'Kerala Fry', code: 'KF' },
    { productId: bj.id, name: 'Teriyaki', code: 'TY' },
    { productId: bj.id, name: 'Gochujang', code: 'GC' },
    { productId: bj.id, name: 'Smokey Masala Buff', code: 'SM' },
    { productId: bj.id, name: 'Pepper', code: 'PP' },
    // Chicken Jerky
    { productId: cj.id, name: 'Teriyaki', code: 'TY' },
    { productId: cj.id, name: 'Gochujang', code: 'GC' },
    { productId: cj.id, name: 'Smokey Masala', code: 'SM' },
    { productId: cj.id, name: 'Karnataka Nati', code: 'KN' },
    { productId: cj.id, name: 'Murgh Mughlai', code: 'MM' },
    // Chicken Chips
    { productId: cc.id, name: 'Cheddar Cheese', code: 'CH' },
    { productId: cc.id, name: 'Sea Salt', code: 'SS' },
    { productId: cc.id, name: 'Amritsari Achari', code: 'AA' },
    { productId: cc.id, name: 'Portuguese Peri-Peri', code: 'PR' },
    // Pork Puffs
    { productId: pp.id, name: 'Amritsari Achari', code: 'AA' },
    { productId: pp.id, name: 'Portuguese Peri-Peri', code: 'PR' },
  ];

  for (const f of flavourData) {
    await prisma.flavour.upsert({
      where: { productId_code: { productId: f.productId, code: f.code } },
      update: { name: f.name },
      create: f,
    });
  }

  console.log('  Flavours seeded.');
}

async function seedStagesForProduct(productCode: string, stages: StageDef[]) {
  const product = await prisma.product.findUniqueOrThrow({ where: { code: productCode } });

  // Delete existing fields and stages for this product (cascade-safe order)
  const existingStages = await prisma.processStage.findMany({
    where: { productId: product.id },
    select: { id: true },
  });

  if (existingStages.length > 0) {
    const stageIds = existingStages.map((s) => s.id);
    await prisma.stageField.deleteMany({ where: { stageId: { in: stageIds } } });
    await prisma.processStage.deleteMany({ where: { productId: product.id } });
  }

  // Create stages and fields
  for (const stage of stages) {
    const createdStage = await prisma.processStage.create({
      data: {
        productId: product.id,
        name: stage.name,
        order: stage.order,
        isQcGate: stage.isQcGate,
      },
    });

    const fieldCreateData = stage.fields.map((field, index) => ({
      stageId: createdStage.id,
      name: field.name,
      labelEn: field.labelEn,
      labelHi: field.labelHi,
      fieldType: field.fieldType,
      unit: field.unit ?? null,
      minValue: field.minValue ?? null,
      maxValue: field.maxValue ?? null,
      required: field.required,
      order: index + 1,
    }));

    await prisma.stageField.createMany({ data: fieldCreateData });
  }
}

async function seedProcessStages() {
  console.log('Seeding process stages and fields...');

  await seedStagesForProduct('BJ', jerkyStages(5.8));
  console.log('  Buffalo Jerky stages seeded (7 stages).');

  await seedStagesForProduct('CJ', jerkyStages(6.0));
  console.log('  Chicken Jerky stages seeded (7 stages).');

  await seedStagesForProduct('CC', chickenChipsStages);
  console.log('  Chicken Chips stages seeded (12 stages).');

  await seedStagesForProduct('PP', porkPuffsStages);
  console.log('  Pork Puffs stages seeded (11 stages).');

  console.log('  All process stages seeded.');
}

// ─── MAIN ───────────────────────────────────────────

async function main() {
  console.log('Starting DOKi QC Tool database seed...\n');

  await seedUsers();
  await seedProducts();
  await seedFlavours();
  await seedProcessStages();

  console.log('\nSeed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
