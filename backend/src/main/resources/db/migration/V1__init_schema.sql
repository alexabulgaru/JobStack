CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255)
);

CREATE TABLE statuses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE tags (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE job_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    job_title VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    status_id BIGINT NOT NULL,
    CONSTRAINT fk_job_app_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_job_app_status FOREIGN KEY (status_id) REFERENCES statuses(id)
);

CREATE TABLE application_details (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    hr_contact_email VARCHAR(255),
    job_application_id BIGINT UNIQUE,
    CONSTRAINT fk_app_details_job FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);

CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE job_application_tags (
    job_application_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    PRIMARY KEY (job_application_id, tag_id),
    CONSTRAINT fk_jat_job FOREIGN KEY (job_application_id) REFERENCES job_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_jat_tag FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
