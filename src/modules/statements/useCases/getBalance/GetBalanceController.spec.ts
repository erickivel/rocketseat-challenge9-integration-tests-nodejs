import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show a balance with statements", async () => {
        await request(app).post("/api/v1/users").send({
            email: "user@example.com",
            name: "User Name",
            password: "password"
        });

        const responseToken = await request(app).post("/api/v1/sessions").send({
            email: "user@example.com",
            password: "password"
        })

        const { token } = responseToken.body;

        await request(app).post("/api/v1/statements/deposit").send({
            amount: 100,
            description: "Deposit Test"
        }).set({
            Authorization: `Bearer ${token}`
        });

        await request(app).post("/api/v1/statements/withdraw").send({
            amount: 40,
            description: "Withdraw Test"
        }).set({
            Authorization: `Bearer ${token}`
        });

        const { body: responseBody } = await request(app).get("/api/v1/statements/balance").set({
            Authorization: `Bearer ${token}`
        });

        expect(responseBody).toHaveProperty("statement");
        expect(responseBody.statement[1]).toHaveProperty("id");
        expect(responseBody.statement[1].amount).toBe(40);
        expect(responseBody).toHaveProperty("balance");
        expect(responseBody.balance).toBe(60);
    });
});