import { auth } from "@/utils/auth";

export type RouteHandler = (root: HTMLElement) => Promise<void> | void;

export interface RouteOptions {
  auth?: "public" | "private" | "guest";
}

interface Route {
  path: string;
  handler: RouteHandler;
  options: RouteOptions;
}

export class Router {
  private routes: Route[] = [];
  private rootQuery: string;

  constructor(rootQuery: string) {
    this.rootQuery = rootQuery;
  }

  public use(
    path: string,
    handler: RouteHandler,
    options: RouteOptions = {},
  ): this {
    this.routes.push({ path, handler, options });
    return this;
  }

  public start(): void {
    window.onpopstate = () => this.handleRoute(window.location.pathname);
    document.body.addEventListener("click", (event) => {
      const anchor = (event.target as HTMLElement).closest("a");
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("mailto:") || href.startsWith("tel:"))
        return;
      if (href.startsWith("http://") || href.startsWith("https://")) {
        const locationOrigin = window.location.origin;
        if (!href.startsWith(locationOrigin)) return;
      }

      if (href.startsWith("/")) {
        event.preventDefault();
        this.go(href);
      }
    });

    this.handleRoute(window.location.pathname);
  }

  public go(path: string, replace = false): void {
    if (replace) {
      window.history.replaceState({}, "", path);
    } else {
      window.history.pushState({}, "", path);
    }
    this.handleRoute(path);
  }

  public back(): void {
    window.history.back();
  }

  public forward(): void {
    window.history.forward();
  }

  private handleRoute(pathname: string): void {
    const path = pathname.replace(/\/?$/, "") || "/";
    const route = this.routes.find((routeItem) => routeItem.path === path);
    const root = document.querySelector<HTMLElement>(this.rootQuery);
    if (!root) {
      throw new Error(`Root element not found: ${this.rootQuery}`);
    }

    if (!route) {
      this.go("/404", true);
      return;
    }

    const user = auth.current();
    if (route.options.auth === "private" && !user) {
      this.go("/", true);
      return;
    }
    if (route.options.auth === "guest" && user) {
      this.go("/messenger", true);
      return;
    }

    root.replaceChildren();
    try {
      route.handler(root);
    } catch {
      this.go("/500", true);
    }
  }
}

export const router = new Router("#app");
