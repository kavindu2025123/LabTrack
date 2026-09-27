-- ==========================================
-- 1. CUSTOM TYPES & ENUMS
-- ==========================================
CREATE TYPE user_role AS ENUM ('Student', 'Technical_Officer', 'Admin');
CREATE TYPE equipment_status AS ENUM ('Available', 'Reserved', 'Issued', 'Maintenance', 'Unavailable');
CREATE TYPE reservation_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Completed');
CREATE TYPE payment_status AS ENUM ('Unpaid', 'Paid');
CREATE TYPE ticket_status AS ENUM ('Open', 'Resolved');

-- ==========================================
-- 2. USERS & AUTHENTICATION
-- ==========================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. ORGANIZATIONAL STRUCTURE
-- ==========================================
CREATE TABLE departments (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- UPDATED: technical_officer_id added directly to the laboratory
CREATE TABLE laboratories (
    lab_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    department_id INT REFERENCES departments(department_id) ON DELETE CASCADE,
    technical_officer_id INT REFERENCES users(user_id) ON DELETE SET NULL
);

-- ==========================================
-- 4. EQUIPMENT INVENTORY
-- ==========================================
CREATE TABLE equipment_categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE equipment (
    equipment_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_id INT REFERENCES equipment_categories(category_id) ON DELETE SET NULL,
    lab_id INT REFERENCES laboratories(lab_id) ON DELETE CASCADE,
    is_bulk BOOLEAN DEFAULT FALSE, 
    total_quantity INT DEFAULT 1,  
    available_quantity INT DEFAULT 1, 
    status equipment_status DEFAULT 'Available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. RESERVATIONS & ISSUING
-- ==========================================
CREATE TABLE reservations (
    reservation_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    lab_id INT REFERENCES laboratories(lab_id) ON DELETE CASCADE,
    reserved_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status reservation_status DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservation_items (
    reservation_item_id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    equipment_id INT REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    quantity_requested INT DEFAULT 1 
);

CREATE TABLE borrowing_records (
    record_id SERIAL PRIMARY KEY,
    reservation_id INT REFERENCES reservations(reservation_id) ON DELETE CASCADE,
    issued_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    returned_at TIMESTAMP
);

-- ==========================================
-- 6. FINES & PAYMENTS
-- ==========================================
CREATE TABLE fines (
    fine_id SERIAL PRIMARY KEY,
    record_id INT REFERENCES borrowing_records(record_id) ON DELETE CASCADE,
    student_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payment_status DEFAULT 'Unpaid',
    stripe_payment_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 7. MAINTENANCE & TICKETS
-- ==========================================
CREATE TABLE maintenance_tickets (
    ticket_id SERIAL PRIMARY KEY,
    equipment_id INT REFERENCES equipment(equipment_id) ON DELETE CASCADE,
    reported_by INT REFERENCES users(user_id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'Open',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ==========================================
-- 8. PERFORMANCE INDEXES
-- ==========================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_laboratories_to_id ON laboratories(technical_officer_id);
CREATE INDEX idx_equipment_lab_id ON equipment(lab_id);
CREATE INDEX idx_equipment_category_id ON equipment(category_id);
CREATE INDEX idx_reservations_student_id ON reservations(student_id);
CREATE INDEX idx_reservations_lab_id ON reservations(lab_id);
CREATE INDEX idx_reservation_items_res_id ON reservation_items(reservation_id);
CREATE INDEX idx_borrowing_records_res_id ON borrowing_records(reservation_id);
CREATE INDEX idx_fines_student_id ON fines(student_id);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_maintenance_equipment_id ON maintenance_tickets(equipment_id);
