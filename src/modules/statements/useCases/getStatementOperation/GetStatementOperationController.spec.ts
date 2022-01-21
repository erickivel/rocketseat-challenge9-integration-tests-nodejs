import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to show a statement operation", async () => {
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

        const { body: statementResponse } = await request(app).post("/api/v1/statements/deposit").send({
            amount: 100,
            description: "Deposit Test"
        }).set({
            Authorization: `Bearer ${token}`
        });

        const { body: responseStatements } = await request(app).get(`/api/v1/statements/${statementResponse.id}`).set({
            Authorization: `Bearer ${token}`
        });

        expect(responseStatements).toHaveProperty("id");
        expect(responseStatements).toHaveProperty("amount");
        expect(responseStatements.amount).toBe("100.00");
    });
});