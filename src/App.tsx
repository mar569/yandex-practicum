export function App(): string {
  return `
    <main class="home">
      <h1 class="home__title">Чат</h1>
      <nav class="home__nav" aria-label="Карта страниц">
        <ul>
          <li><a href="/">Авторизация</a></li>
          <li><a href="/sign-up">Регистрация</a></li>
          <li><a href="/settings">Профиль</a></li>
        </ul>
      </nav>
    </main>
  `;
}
