CREATE TABLE feedbacks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    contact_consent BOOLEAN NOT NULL,
    comments TEXT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedbacks_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
