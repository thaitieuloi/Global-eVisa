-- 1. Destinations
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Nationalities
CREATE TABLE nationalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Visa Types
CREATE TABLE visa_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Visa Eligibilities
CREATE TABLE visa_eligibilities (
    visa_type_id UUID REFERENCES visa_types(id) ON DELETE CASCADE,
    nationality_id UUID REFERENCES nationalities(id) ON DELETE CASCADE,
    is_eligible BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    PRIMARY KEY (visa_type_id, nationality_id)
);

-- 5. Visa Pricings
CREATE TABLE visa_pricings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visa_type_id UUID REFERENCES visa_types(id) ON DELETE CASCADE,
    processing_time_value INTEGER NOT NULL,
    processing_time_unit VARCHAR(20) NOT NULL, -- 'days' or 'hours'
    government_fee DECIMAL(10,2) NOT NULL,
    processing_fee DECIMAL(10,2) NOT NULL,
    service_fee DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Visa Pricing Histories
CREATE TABLE visa_pricing_histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pricing_id UUID REFERENCES visa_pricings(id) ON DELETE SET NULL,
    visa_type_id UUID,
    government_fee DECIMAL(10,2),
    processing_fee DECIMAL(10,2),
    service_fee DECIMAL(10,2),
    action_type VARCHAR(20), -- 'CREATE', 'UPDATE', 'DELETE'
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Visa Orders
CREATE TABLE visa_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visa_id UUID REFERENCES visa_types(id) ON DELETE SET NULL,
    visa_name VARCHAR(255) NOT NULL,
    visa_code VARCHAR(50) NOT NULL,
    pricing_id UUID REFERENCES visa_pricings(id) ON DELETE SET NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    government_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    service_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    processing_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL,
    passport_data JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_eligibilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_pricings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_orders ENABLE ROW LEVEL SECURITY;

-- Create Policies (Allow public read for this demo)
CREATE POLICY "Allow public read on destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Allow public read on nationalities" ON nationalities FOR SELECT USING (true);
CREATE POLICY "Allow public read on visa_types" ON visa_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on visa_eligibilities" ON visa_eligibilities FOR SELECT USING (true);
CREATE POLICY "Allow public read on visa_pricings" ON visa_pricings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on visa_orders" ON visa_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on visa_orders" ON visa_orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on visa_orders" ON visa_orders FOR UPDATE USING (true);

-- Sample Data Seeding
-- Clear existing data
TRUNCATE visa_pricing_histories, visa_orders, visa_pricings, visa_eligibilities, visa_types, nationalities, destinations CASCADE;

-- 1. Destinations
INSERT INTO destinations (iso_code, name) VALUES 
('KHM', 'Cambodia'),
('LAO', 'Laos'),
('QAT', 'Qatar');

-- 2. Nationalities
INSERT INTO nationalities (iso_code, name) VALUES 
('AFG', 'Afghanistan'),
('ALA', 'Aland Islands'),
('ALB', 'Albania'),
('DZA', 'Algeria'),
('ASM', 'America Samoa'),
('AND', 'Andorra'),
('AGO', 'Angola'),
('AIA', 'Anguilla'),
('ATA', 'Antarctica'),
('ATG', 'Antigua and Barbuda');

-- 3. Visa Types
-- Cambodia
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'eVisa T', 'Tourist eVisa' FROM destinations WHERE iso_code = 'KHM';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'eVisa E', 'Business eVisa' FROM destinations WHERE iso_code = 'KHM';

-- Laos
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'Tourist eVisa', 'Tourist eVisa' FROM destinations WHERE iso_code = 'LAO';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'Lao PDR', 'Lao PDR Visa' FROM destinations WHERE iso_code = 'LAO';

-- Qatar
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'A1', 'Visa A1' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'A2', 'Visa A2' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'A3', 'Visa A3' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'A4', 'Visa A4' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'F1', 'Visa F1' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'B', 'Visa B' FROM destinations WHERE iso_code = 'QAT';
INSERT INTO visa_types (destination_id, code, name) 
SELECT id, 'Transit', 'Transit Visa' FROM destinations WHERE iso_code = 'QAT';

-- 4. Eligibility
-- Cambodia Eligibility
INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code IN ('eVisa T', 'eVisa E') AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM')
AND n.iso_code IN ('ALA', 'ALB', 'DZA', 'ASM', 'AGO', 'AIA', 'ATA');

INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code = 'eVisa E' AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM')
AND n.iso_code = 'AND';

INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code = 'eVisa T' AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM')
AND n.iso_code = 'ATG';

-- Laos Eligibility
INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code = 'Lao PDR' AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO')
AND n.iso_code IN ('AFG', 'ALB');

INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code = 'Tourist eVisa' AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO')
AND n.iso_code = 'ALA';

INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code IN ('Tourist eVisa', 'Lao PDR') AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO')
AND n.iso_code IN ('DZA', 'ASM', 'AND', 'AGO', 'AIA', 'ATA', 'ATG');

-- Qatar Eligibility
INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code IN ('A1', 'A2', 'A3', 'A4', 'B', 'Transit') AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT')
AND n.iso_code IN ('AFG', 'ALB', 'DZA', 'AND', 'AGO', 'AIA', 'ATA', 'ATG');

INSERT INTO visa_eligibilities (visa_type_id, nationality_id)
SELECT vt.id, n.id FROM visa_types vt, nationalities n 
WHERE vt.code = 'F1' AND vt.destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT')
AND n.iso_code IN ('AGO', 'AIA', 'ATA', 'ATG');

-- 5. Pricing
-- Cambodia eVisa T
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'eVisa T' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 40, 30, 44 FROM visa_types WHERE code = 'eVisa T' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'days', 40, 60, 44 FROM visa_types WHERE code = 'eVisa T' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');

-- Cambodia eVisa E
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 45, 0, 44 FROM visa_types WHERE code = 'eVisa E' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 45, 30, 44 FROM visa_types WHERE code = 'eVisa E' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'days', 45, 60, 44 FROM visa_types WHERE code = 'eVisa E' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'KHM');

-- Laos Tourist eVisa
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 7, 'days', 60, 0, 44 FROM visa_types WHERE code = 'Tourist eVisa' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 60, 10, 44 FROM visa_types WHERE code = 'Tourist eVisa' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'days', 60, 20, 44 FROM visa_types WHERE code = 'Tourist eVisa' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');

-- Laos Lao PDR
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 10, 0, 50 FROM visa_types WHERE code = 'Lao PDR' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 10, 30, 55 FROM visa_types WHERE code = 'Lao PDR' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 1, 'days', 10, 60, 60 FROM visa_types WHERE code = 'Lao PDR' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'LAO');

-- Qatar A1
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'A1' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 3, 'days', 40, 30, 44 FROM visa_types WHERE code = 'A1' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar A2
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'A2' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 40, 30, 44 FROM visa_types WHERE code = 'A2' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar A3
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'A3' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 3, 'days', 40, 30, 44 FROM visa_types WHERE code = 'A3' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar A4
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'A4' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'days', 40, 30, 44 FROM visa_types WHERE code = 'A4' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar F1
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'F1' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 40, 30, 44 FROM visa_types WHERE code = 'F1' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar B
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 5, 'days', 40, 0, 44 FROM visa_types WHERE code = 'B' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 4, 'days', 40, 30, 44 FROM visa_types WHERE code = 'B' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');

-- Qatar Transit
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'days', 10, 0, 44 FROM visa_types WHERE code = 'Transit' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
INSERT INTO visa_pricings (visa_type_id, processing_time_value, processing_time_unit, government_fee, processing_fee, service_fee)
SELECT id, 2, 'hours', 10, 30, 44 FROM visa_types WHERE code = 'Transit' AND destination_id = (SELECT id FROM destinations WHERE iso_code = 'QAT');
