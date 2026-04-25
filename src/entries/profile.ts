import '../styles/main.scss';
import Handlebars from 'handlebars';
import tpl from '../pages/profile.hbs?raw';
import { renderHandlebarsFragment } from '../utils/dom';
import { auth } from '../utils/auth';
import { staticHtml } from '../utils/staticHtmlUrl';

const app = document.getElementById('app');
if (!app) throw new Error('Нет контейнера #app');

const me = auth.current();
if (!me) {
  window.location.assign(staticHtml('login.html'));
} else {
  const { password: _pw, ...ctx } = me;
  void _pw;
  renderHandlebarsFragment(app, Handlebars.compile(tpl)(ctx));

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    auth.logout();
    window.location.assign(staticHtml('login.html'));
  });

  const avatarWrap = document.querySelector(
    '.profile__avatar-wrap'
  ) as HTMLElement;
  const avatarInput = document.getElementById('avatar') as HTMLInputElement;

  if (avatarWrap && avatarInput) {
    avatarWrap.addEventListener('click', () => {
      avatarInput.click();
    });

    avatarInput.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        auth.update({ avatar: reader.result as string });
        window.location.reload();
      };
      reader.readAsDataURL(file);
    });
  }
}
