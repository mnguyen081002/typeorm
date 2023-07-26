import { Post } from "../entity/Post"
import { EntitySubscriberInterface, EventSubscriber } from "../../../../src"
import {
    AfterQueryEvent,
    BeforeQueryEvent,
} from "../../../../src/subscriber/event/QueryEvent"
import fs from "fs"
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
    listenTo() {
        return Post
    }

    beforeQuery(event: BeforeQueryEvent<Post>): void | Promise<any> {
        fs.appendFileSync("before-query.log", "executed\n")
    }

    afterQuery(event: AfterQueryEvent<Post>): void | Promise<any> {
        fs.appendFileSync("after-query.log", "executed\n")
    }
}
