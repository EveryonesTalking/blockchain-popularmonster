-- Insert sample user
INSERT INTO users (username, email, password)
VALUES ('nathan', 'nathan@example.com', '12345');

-- Insert sample note
INSERT INTO notes (user_id, content)
VALUES (1, 'Genesis blockchain note!');
