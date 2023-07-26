import "reflect-metadata"
import appRootPath from "app-root-path"
import sinon from "sinon"
import { DataSource } from "../../../src"
import fs from "fs"
import {
    createTestingConnections,
    reloadTestingDatabases,
    closeTestingConnections,
} from "../../utils/test-utils"
import { PlatformTools } from "../../../src/platform/PlatformTools"
import { expect } from "chai"

describe("github issues > #3302 Tracking query time for slow queries and statsd timers", () => {
    let connections: DataSource[]
    let stub: sinon.SinonStub

    before(async () => {
        connections = await createTestingConnections({
            entities: [__dirname + "/entity/*{.js,.ts}"],
            subscribers: [__dirname + "/subscriber/*{.js,.ts}"],
        })
        stub = sinon.stub(PlatformTools, "appendFileSync")
    })
    beforeEach(() => reloadTestingDatabases(connections))
    afterEach(async () => {
        stub.resetHistory()
        fs.unlinkSync(appRootPath + "/before-query.log")
        fs.unlinkSync(appRootPath + "/after-query.log")
        await closeTestingConnections(connections)
    })

    it("if query executed, should write query to file", async () =>
        Promise.all(
            connections.map(async (connection) => {
                const testQuery = `SELECT COUNT(*) FROM ${connection.driver.escape(
                    "post",
                )}`

                await connection.query(testQuery)
                const beforeQueryLogPath = appRootPath + "/before-query.log"
                const afterQueryLogPath = appRootPath + "/after-query.log"

                fs.existsSync(beforeQueryLogPath).should.be.true
                fs.existsSync(afterQueryLogPath).should.be.true

                const beforeQueryLog = fs.readFileSync(beforeQueryLogPath, {
                    encoding: "utf8",
                })

                expect(beforeQueryLog.includes("executed")).to.be.true
                expect(beforeQueryLog.includes("executed")).to.be.true
            }),
        ))
})
