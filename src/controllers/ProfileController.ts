import { auth } from "@/utils/auth";
import { router } from "@/core/Router";
import { bindFormValidation } from "@/utils/form";
import { validators } from "@/utils/validation";

export class ProfileController {
  public initProfilePage(): void {
    const me = auth.current();
    if (!me) {
      router.go("/");
      return;
    }

    document
      .getElementById("logout-btn")
      ?.addEventListener("click", async () => {
        try {
          await auth.logout();
          router.go("/");
        } catch (error) {
          console.error("Logout failed:", error);
          // Logout locally even if server request fails
          router.go("/");
        }
      });

    const avatarWrap = document.querySelector<HTMLElement>(
      ".profile__avatar-wrap",
    );
    const avatarInput = document.getElementById(
      "avatar",
    ) as HTMLInputElement | null;

    if (avatarWrap && avatarInput) {
      avatarWrap.addEventListener("click", () => avatarInput.click());
      avatarInput.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            await auth.update({ avatar: reader.result as string });
            router.go("/settings");
          } catch (error) {
            console.error("Avatar upload failed:", error);
            const errorMsg =
              error instanceof Error
                ? error.message
                : "Failed to upload avatar";
            alert(errorMsg);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  public initEditPage(form: HTMLFormElement): void {
    const me = auth.current();
    if (!me) {
      router.go("/");
      return;
    }

    bindFormValidation(
      form,
      {
        email: validators.email,
        login: validators.login,
        first_name: validators.name,
        second_name: validators.name,
        display_name: validators.name,
        phone: validators.phone,
      },
      async (data) => {
        try {
          await auth.update({
            email: data.email,
            login: data.login,
            first_name: data.first_name,
            second_name: data.second_name,
            display_name: data.display_name,
            phone: data.phone,
          });
          router.go("/settings");
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

  public initPasswordPage(form: HTMLFormElement): void {
    if (!auth.current()) {
      router.go("/");
      return;
    }

    bindFormValidation(
      form,
      {
        old_password: (value) =>
          value.trim() ? null : "Введите старый пароль",
        new_password: validators.password,
      },
      async (data) => {
        try {
          await auth.changePassword(data.old_password, data.new_password);
          const success = form.querySelector<HTMLElement>("#form-success");
          if (success) {
            success.textContent = "Пароль обновлён";
          }
          form.reset();
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
}
