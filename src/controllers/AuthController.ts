import { bindFormValidation } from "@/utils/form";
import { auth } from "@/utils/auth";
import { router } from "@/core/Router";
import { validators } from "@/utils/validation";

export class AuthController {
  public initLogin(form: HTMLFormElement): void {
    if (auth.current()) {
      router.go("/messenger");
      return;
    }

    bindFormValidation(
      form,
      {
        login: validators.login,
        password: validators.password,
      },
      async (data) => {
        try {
          await auth.login(data.login, data.password);
          router.go("/messenger");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          const errorEl = form.querySelector<HTMLDivElement>("#form-error");
          if (errorEl) {
            errorEl.textContent = message;
          }
        }
      },
    );
  }

  public initRegister(form: HTMLFormElement): void {
    if (auth.current()) {
      router.go("/messenger");
      return;
    }

    bindFormValidation(
      form,
      {
        email: validators.email,
        login: validators.login,
        first_name: validators.name,
        second_name: validators.name,
        phone: validators.phone,
        password: validators.password,
      },
      async (data) => {
        try {
          await auth.register({
            email: data.email,
            login: data.login,
            first_name: data.first_name,
            second_name: data.second_name,
            phone: data.phone,
            password: data.password,
          });
          router.go("/messenger");
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          const errorEl = form.querySelector<HTMLDivElement>("#form-error");
          if (errorEl) {
            errorEl.textContent = message;
          }
        }
      },
    );
  }

  public requireAuth(): void {
    if (!auth.current()) {
      router.go("/");
    }
  }
}
