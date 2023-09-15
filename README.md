
# Secure Movie Blog

The Secure Movie Blog is a web-based platform that allows users to share and explore movie reviews and discussions. The aim of this project is to develop a secure, usable, and accessible movie blog system that prioritizes user privacy and protects against common security vulnerabilities.

## Security Measures trying  to be implemented

## Account Enumeration

The system implements a consistent error message for both existing and non-existing user accounts during the login process to prevent attackers from identifying valid usernames through error messages.

## Session Hijacking

Secure session management techniques are utilized to prevent session hijacking attacks. Session tokens are generated securely and stored in HttpOnly cookies, making it difficult for attackers to steal active sessions.

## SQL Injection

To mitigate SQL injection vulnerabilities, the system employs parameterized queries when interacting with the MySQL database. This prevents malicious SQL code from being executed and ensures data integrity.

## Cross-site Scripting (XSS)

User inputs are sanitized and validated before displaying them in web pages to protect against cross-site scripting attacks and prevent the execution of malicious scripts injected by attackers.

## Cross-site Request Forgery (CSRF)

CSRF tokens are included in forms and requests to prevent cross-site request forgery attacks and ensure that requests originate from legitimate sources, mitigating potential unauthorized actions.

## Authentication and 2FA

User authentication is reinforced with robust hashing and salting techniques to store user passwords securely. The system also supports two-factor authentication (2FA) using One-Time Passwords (OTPs) sent via email to enhance the overall security of user accounts.
