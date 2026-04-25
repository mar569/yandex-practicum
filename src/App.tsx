import { staticHtml } from "@/utils/staticHtmlUrl";

export function App() {
  return (
    <main className="home">
      <h1 className="home__title">Чат</h1>
      <nav className="home__nav" aria-label="Карта страниц">
        <ul>
          <li>
            <a href={staticHtml("login.html")}>Авторизация</a>
          </li>
          <li>
            <a href={staticHtml("register.html")}>Регистрация</a>
          </li>
          <li>
            <a href={staticHtml("profile.html")}>Профиль</a>
          </li>
        </ul>
      </nav>
    </main>
  );
}
