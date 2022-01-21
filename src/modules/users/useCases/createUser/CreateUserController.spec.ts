import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;

describe("Create User", () => {
    beforeAll(async () => {
        connection = await createConnection();
        await connection.runMigrations();
    });

    afterAll(async () => {
        await connection.dropDatabase();
        await connection.close();
    });

    it("should be able to create a new user", async () => {
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

        const { body } = await request(app).get("/api/v1/profile").set({
            Authorization: `Bearer ${token}`
        });

        expect(body).toHaveProperty("id");
        expect(body).toHaveProperty("name");
        expect(body.name).toBe("User Name");
        expect(body).toHaveProperty("email");
        expect(body.email).toBe("user@example.com");
    });
});