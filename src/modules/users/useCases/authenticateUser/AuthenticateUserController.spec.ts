import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate a User", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to authenticate a user", async () => {
        await request(app).post("/api/v1/users").send({
            email: "user@example.com",
            name: "User Name",
            password: "password"
        });

        const { body: responseAuthentication } = await request(app).post("/api/v1/sessions").send({
            email: "user@example.com",
            password: "password"
        })

        expect(responseAuthentication).toHaveProperty("user");
        expect(responseAuthentication).toHaveProperty("token");
        expect(responseAuthentication.user).toHaveProperty("id");
    });
});