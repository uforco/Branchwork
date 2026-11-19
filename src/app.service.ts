import { Injectable } from '@nestjs/common';
import { DbPrismaService } from './config/db-prisma/db-prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: DbPrismaService) {}

  getHello(): string {
    return `
    
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BRANCHWORK | Welcome</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    min-height: 100vh;
    font-family: Arial, Helvetica, sans-serif;
    background: #0b1120;
    color: #e2e8f0;
    display: flex;
    align-items: center;
    justify-content: center;
">

    <main style="
        width: 90%;
        max-width: 850px;
        margin: 40px auto;
        text-align: center;
    ">

        <!-- Project Logo -->
        <div style="
            width: 75px;
            height: 75px;
            margin: 0 auto 25px;
            border-radius: 20px;
            background: linear-gradient(135deg, #2563eb, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: bold;
            color: white;
            box-shadow: 0 10px 35px rgba(37, 99, 235, 0.3);
        ">
            B
        </div>

        <!-- Project Title -->
        <p style="
            color: #60a5fa;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 4px;
            margin-bottom: 12px;
        ">
            PROJECT
        </p>

        <h1 style="
            font-size: 52px;
            font-weight: 800;
            letter-spacing: 3px;
            color: #ffffff;
            margin: 0 0 18px;
        ">
            BRANCHWORK
        </h1>

        <p style="
            max-width: 600px;
            margin: 0 auto;
            color: #94a3b8;
            font-size: 16px;
            line-height: 1.8;
        ">
            Welcome to BRANCHWORK. A backend-focused application
            developed with modern technologies, clean architecture,
            and scalable development practices.
        </p>

        <!-- Documentation Links -->
        <div style="
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-top: 40px;
        ">

            <a href="http://localhost:${process.env.PORT ?? 3000}/docs"
               target="_blank"
               style="
                   display: inline-block;
                   padding: 15px 25px;
                   border-radius: 10px;
                   background: #2563eb;
                   color: white;
                   text-decoration: none;
                   font-size: 14px;
                   font-weight: bold;
               ">
                API Documentation →
            </a>

            <a href="https://github.com/uforco/Branchwork"
               target="_blank"
               rel="noopener noreferrer"
               style="
                   display: inline-block;
                   padding: 15px 25px;
                   border-radius: 10px;
                   background: #1e293b;
                   border: 1px solid #334155;
                   color: white;
                   text-decoration: none;
                   font-size: 14px;
                   font-weight: bold;
               ">
                GitHub Repository →
            </a>

        </div>

        <!-- Developer Information -->
        <div style="
            margin-top: 65px;
            padding: 30px 20px;
            background: #111c30;
            border: 1px solid #243249;
            border-radius: 16px;
        ">

            <p style="
                color: #60a5fa;
                font-size: 12px;
                font-weight: bold;
                letter-spacing: 3px;
                margin: 0 0 15px;
            ">
                DEVELOPED BY
            </p>

            <h2 style="
                color: #ffffff;
                font-size: 24px;
                margin: 0 0 8px;
            ">
                Md Sharif
            </h2>

            <p style="
                color: #94a3b8;
                font-size: 14px;
                margin: 0 0 20px;
            ">
                Full Stack Software Engineer | Backend Focused
            </p>

            <div style="
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                gap: 20px;
            ">

                <a href="https://github.com/uforco"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="color: #93c5fd; text-decoration: none; font-size: 13px;">
                    GitHub
                </a>

                <a href="https://sharifdev.vercel.app"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="color: #93c5fd; text-decoration: none; font-size: 13px;">
                    Portfolio
                </a>

                <a href="https://sharifdev.vercel.app/resume.pdf"
                   target="_blank"
                   rel="noopener noreferrer"
                   style="color: #93c5fd; text-decoration: none; font-size: 13px;">
                    Resume
                </a>

            </div>

            <p style="
                color: #64748b;
                font-size: 12px;
                margin: 22px 0 0;
            ">
                Dhaka, Bangladesh
            </p>

        </div>

        <!-- Footer -->
        <footer style="
            margin-top: 30px;
            color: #64748b;
            font-size: 12px;
        ">
            <p>
                © 2026 BRANCHWORK. All rights reserved.
            </p>
            <p>
                Designed & Developed by Md Sharif.
            </p>
        </footer>

    </main>

</body>
</html>

    `;
  }
}
