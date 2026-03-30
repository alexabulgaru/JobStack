ALTER TABLE job_applications ADD COLUMN applied_date DATE;

UPDATE job_applications SET applied_date = CURRENT_DATE WHERE applied_date IS NULL;

ALTER TABLE job_applications MODIFY COLUMN applied_date DATE NOT NULL;
