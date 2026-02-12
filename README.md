
Event Management & Ticketing System

This project is a web-based Event Management & Ticketing System built during a 6-hour hackathon.
The goal was to create a real-world event booking system where users can book tickets and organizers can manage attendees.

The system allows attendees to browse events, book tickets, and receive a QR-based ticket. Organizers can view the attendee list and validate tickets.



 Technologies Used

React JS

Tailwind CSS

Firebase Authentication

Firebase Firestore (for storing bookings)

qrcode.react (for QR code generation)

👥 User Roles
👤 Attendee

Can view all events

Can check event details

Can book ticket

Receives a unique QR code

Can see booked tickets in "My Tickets"

 Organizer

Has access to dashboard

Can see attendee list per event

Can see total ticket count

Can validate tickets (mark as used)


🔐 Demo Login Credentials
Organizer

Email: mabbas@gmail.com

Password: 12345678

Attendee

Email: msalman@gmail.com

Password: 12345678



⚙ Features Implemented

User authentication using Firebase

Event listing page

Event details page

Ticket booking system

Unique ticket ID generation

QR code for every ticket

Organizer dashboard

Ticket limit per user

Sold out logic

Booking disabled after event date

Protected organizer access



 How It Works

User logs in

Browses events

Opens event details

Clicks on “Book Ticket”

Ticket is generated with a unique ID

QR code is created

Organizer can verify ticket from dashboard



 What I Learned

Handling authentication with Firebase

Managing user roles (Attendee & Organizer)

Generating QR codes dynamically

Implementing booking logic with validations

Building a clean and functional dashboard
