import { content } from '../game/content.js';

export class UIManager {
  constructor(game) {
    this.game = game; // Reference back to game to pause/resume
    this.uiLayer = document.getElementById('ui-layer');
    this.currentLanguage = 'en';
    this.isDialogueOpen = false;

    // Set up the language switch button in sidebar
    this.setupLangSwitch();

    // Set up nav link click handlers
    this.setupNavLinks();

    // Set up download button
    this.setupDownloadButton();
  }

  setupNavLinks() {
    const navLinks = document.querySelectorAll('.link-item[data-type]');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const type = link.getAttribute('data-type');
        if (type) {
          this.showDialogue(type);
        }
      });
    });
  }

  setupDownloadButton() {
    const downloadBtn = document.querySelector('.download-section .pixel-btn');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        // Download the appropriate portfolio based on language
        const portfolioUrl = this.currentLanguage === 'jp'
          ? `${import.meta.env.BASE_URL}tejashree-portfolio-jp.pdf`
          : `${import.meta.env.BASE_URL}tejashree-portfolio-eng.pdf`;

        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = portfolioUrl;
        link.download = this.currentLanguage === 'jp'
          ? 'Tejashree-Portfolio-JP.pdf'
          : 'Tejashree-Portfolio-EN.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  setupLangSwitch() {
    const langSwitch = document.querySelector('[lang-switch]');
    if (langSwitch) {
      langSwitch.style.cursor = 'pointer';
      langSwitch.style.padding = '5px 10px';
      langSwitch.style.background = '#333';
      langSwitch.style.borderRadius = '4px';
      langSwitch.style.transition = 'background 0.2s';
      langSwitch.style.whiteSpace = 'nowrap';

      langSwitch.addEventListener('mouseenter', () => {
        langSwitch.style.background = '#555';
      });
      langSwitch.addEventListener('mouseleave', () => {
        langSwitch.style.background = '#333';
      });

      langSwitch.addEventListener('click', () => {
        this.currentLanguage = this.currentLanguage === 'en' ? 'jp' : 'en';
        this.updateLangSwitchDisplay();
        this.updateSidebarLanguage();
      });
    }
  }

  updateLangSwitchDisplay() {
    const langSwitch = document.querySelector('[lang-switch]');
    if (langSwitch) {
      if (this.currentLanguage === 'en') {
        langSwitch.textContent = 'EN 🌐';
      } else {
        langSwitch.textContent = 'JP 🌐';
      }
    }
  }

  updateSidebarLanguage() {
    const isJapanese = this.currentLanguage === 'jp';

    // Sidebar translations
    const translations = {
      title: { en: 'Senior UI/UX Designer', jp: 'シニア UI/UX デザイナー' },
      downloadPortfolio: { en: 'DOWNLOAD<br>PORTFOLIO', jp: 'ポートフォリオ<br>ダウンロード' },
      downloadText: { en: '"Download my full work!"', jp: '「作品集をダウンロード！」' },
      downloadBtn: { en: 'DOWNLOAD', jp: 'ダウンロード' },
      resumeLabel: { en: 'Resume:', jp: '履歴書:' },
      resumeBtn: { en: 'Download', jp: 'ダウンロード' },
      navLinks: {
        about: { en: 'About Me 🙋🏻‍♀️', jp: '自己紹介 🙋🏻‍♀️' },
        skills: { en: 'Skills & Experience 🎨', jp: 'スキル・経験 🎨' },
        bestme: { en: 'What Makes the Best Me 🌟', jp: '自分の強みを発揮できる環境 🌟' },
        improve: { en: "What I'd Like to Improve on 🛠️", jp: '今後伸ばしていきたいこと 🛠️' },
        tidbits: { en: 'Other Tidbits 💭', jp: 'その他・ちょっとしたこと 💭' }
      }
    };

    const lang = this.currentLanguage;

    // Update title
    const titleEl = document.querySelector('.profile-info .title');
    if (titleEl) titleEl.textContent = translations.title[lang];

    // Update download section
    const downloadH3 = document.querySelector('.download-section h3');
    if (downloadH3) downloadH3.innerHTML = translations.downloadPortfolio[lang];

    const downloadText = document.querySelector('.download-section p');
    if (downloadText) downloadText.textContent = translations.downloadText[lang];

    const downloadBtn = document.querySelector('.download-section .pixel-btn');
    if (downloadBtn) downloadBtn.textContent = translations.downloadBtn[lang];

    // Update resume section
    const resumeLabel = document.querySelector('.resume-label');
    if (resumeLabel) resumeLabel.textContent = translations.resumeLabel[lang];

    const resumeBtn = document.querySelector('.resume-btn');
    if (resumeBtn) resumeBtn.textContent = translations.resumeBtn[lang];

    // Update nav links
    const navLinks = document.querySelectorAll('.link-item[data-type]');
    navLinks.forEach(link => {
      const type = link.getAttribute('data-type');
      if (type && translations.navLinks[type]) {
        link.textContent = translations.navLinks[type][lang];
      }
    });
  }

  showLanguageSelection() {
    const modal = document.createElement('div');
    modal.className = 'ui-element modal';
    // Full overlay with dim background
    modal.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 100;';
    modal.innerHTML = `
      <div style="
        background: black; 
        padding: 90px 60px; 
        border: 4px solid white; 
        position: absolute; 
        top: 50%; 
        left: 50%; 
        transform: translate(-50%, -50%); 
        text-align: center; 
        color: white; 
        font-family: 'Press Start 2P', cursive;
        box-shadow: 10px 10px 0px rgba(255,255,255,0.3);
      ">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; line-height: 1.5;">Welcome to Tejashree's Portfolio</h2>
        <p style="margin: 0 0 45px 0; font-family: 'DotGothic16', sans-serif; font-size: 24px;">ようこそ、ポートフォリオへ</p>
        <div style="display: flex; gap: 20px; justify-content: center;">
          <button id="lang-en" style="
            cursor: pointer; 
            padding: 14px 32px; 
            background: linear-gradient(180deg, #ff6f61 0%, #e85a4f 100%); 
            color: white; 
            border: none;
            border-bottom: 4px solid #b34d42;
            font-size: 14px;
            font-weight: bold;
            font-family: 'Press Start 2P', cursive;
          ">English 🇬🇧</button>
          <button id="lang-jp" style="
            cursor: pointer; 
            padding: 14px 32px; 
            background: linear-gradient(180deg, #a855f7 0%, #7c3aed 100%); 
            color: white; 
            border: none;
            border-bottom: 4px solid #5b21b6;
            font-size: 20px;
            font-weight: bold;
            font-family: 'DotGothic16', sans-serif;
          ">日本語 🇯🇵</button>
        </div>
      </div>
    `;
    this.uiLayer.appendChild(modal);

    document.getElementById('lang-en').addEventListener('click', () => {
      this.currentLanguage = 'en';
      modal.remove();
      this.updateLangSwitchDisplay();
      this.updateSidebarLanguage();
    });

    document.getElementById('lang-jp').addEventListener('click', () => {
      this.currentLanguage = 'jp';
      modal.remove();
      this.updateLangSwitchDisplay();
      this.updateSidebarLanguage();
    });
  }

  showDialogue(type) {
    if (this.isDialogueOpen) return false; // Return false if dialogue already open
    this.isDialogueOpen = true;

    // Pause game potentially?
    // this.game.paused = true; 

    const data = content[this.currentLanguage][type];
    if (!data) return false; // Return false if no data

    const isJapanese = this.currentLanguage === 'jp';
    const fontFamily = isJapanese ? "'DotGothic16', sans-serif" : "'Courier New', monospace";

    const modal = document.createElement('div');
    modal.className = 'ui-element modal dialogue-box';
    modal.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 100;';
    modal.innerHTML = `
      <div style="
        background: black; 
        padding: 25px; 
        border: 4px solid white; 
        position: absolute; 
        top: 20%; 
        left: 50%; 
        transform: translate(-50%, 0); 
        width: 80%; 
        max-width: 600px;
        color: white; 
        font-family: ${fontFamily};
        font-size: 18px;
        box-shadow: 10px 10px 0px rgba(255,255,255,0.3);
      ">
        <h2 style="border-bottom: 2px dashed #888; padding-bottom: 10px; margin-bottom: 15px;">${data.title}</h2>
        <ul style="text-align: left; padding-left: 20px; line-height: 1.6;">
          ${data.text.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <button id="close-dialogue" style="
          margin-top: 20px; 
          padding: 8px 16px; 
          background: #ff6f61; 
          color: white; 
          border: none; 
          border-bottom: 3px solid #b34d42;
          cursor: pointer; 
          font-weight: bold;
        ">CLOSE</button>
      </div>
    `;
    this.uiLayer.appendChild(modal);

    document.getElementById('close-dialogue').addEventListener('click', () => {
      this.closeDialogue(modal);
    });

    // Check for click outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeDialogue(modal);
      }
    });

    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeDialogue(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    return true; // Dialogue successfully opened
  }

  closeDialogue(modalElement) {
    modalElement.remove();
    this.isDialogueOpen = false;
    // this.game.paused = false;
  }
}
