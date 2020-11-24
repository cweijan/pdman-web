import { DarukServer, controller, get, DarukContext } from "daruk";

(async () => {
  const myapp = DarukServer();

  @controller()
  class Index {
    @get("/")
    public async index(ctx: DarukContext) {
      ctx.body = "hello world";
    }
  }

  await myapp.binding();
  myapp.listen(8000);
})();