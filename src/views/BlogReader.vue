<template>
  <div class="blog-wrapper" :style="themeStyles" :data-theme="uiStore.currentTheme" ref="scrollContainer">

    <div class="ambient-mesh">
      <div class="blob b1"></div>
      <div class="blob b2"></div>
    </div>
    <div class="noise-overlay"></div>

    <main class="reader-container">

      <nav class="top-nav-bar mb-6" style="display: flex; justify-content: flex-start; align-items: center; flex-wrap: wrap; gap: 15px;">
        <router-link to="/blog" class="btn-outline text-decoration-none">
          <i class="mdi mdi-arrow-left"></i> Back to Archives
        </router-link>

        <div class="breadcrumbs-ui text-mute" aria-label="breadcrumb" v-if="!loading && !error" style="display: flex; align-items: center; flex-wrap: wrap; gap: 5px;">
            <router-link to="/" class="breadcrumb-link"><i class="mdi mdi-home"></i> Home</router-link>
            <span class="separator-icon"><i class="mdi mdi-chevron-right"></i></span>
            <router-link to="/blog" class="breadcrumb-link">Blog</router-link>
            <span class="separator-icon"><i class="mdi mdi-chevron-right"></i></span>
            <span class="breadcrumb-current line-clamp-1" style="max-width: 200px;">{{ meta.title }}</span>
        </div>

        <button v-if="!loading && !error" @click="copyArticleText" class="btn-outline text-decoration-none" style="margin-left: auto;" title="Copy Full Article Text">
          <i class="mdi mdi-content-copy"></i> Copy Article
        </button>
      </nav>

      <div v-if="loading" class="text-center-status py-12">
        <div class="spinner-loader mx-auto mb-4"></div>
        <p class="hero-subtitle glitch-effect text-muted">DECRYPTING DOCUMENT...</p>
      </div>

      <div v-else-if="error" class="text-center-status py-12">
        <p class="font-mono font-bold" style="color: #ff5f56; font-size: 1.2rem;">Error 404: Document not registered.</p>
      </div>

      <div v-else class="reader-layout-grid">

        <div class="main-article-content">
          <article class="manifesto-glass-card custom-padding" itemscope itemtype="https://schema.org/Article">

            <div class="mac-os-dots">
                <span class="red"></span><span class="yellow"></span><span class="green"></span>
                <div class="manifesto-label">sys_doc_v{{ meta.version || '1.0' }}.md</div>
            </div>

            <header class="article-header">
              <h1 class="seo-heading display-title" itemprop="headline">{{ meta.title }}</h1>

              <div class="article-meta text-mute">
                Published on <span itemprop="datePublished" :content="meta.date" class="accent-text">{{ meta.date }}</span>
                <span class="separator">•</span>
                By <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                  <span itemprop="name" class="accent-text">{{ meta.author || 'SYSTEM_ADMIN' }}</span>
                </span>
              </div>

              <figure v-if="meta.cover" class="article-cover mt-6">
                <img :src="meta.cover" :alt="meta.title" itemprop="image" loading="lazy" width="800" height="450" />
              </figure>
            </header>

            <section class="markdown-body" itemprop="articleBody" v-html="htmlContent" @click="handleLinkClick"></section>

            <div v-if="articleTags.length > 0" class="seo-tags-section">
              <span class="tags-title"><i class="mdi mdi-tag-multiple"></i> INDEXED KEYWORDS:</span>
              <div class="tags-grid">
                <router-link
                  v-for="(tag, idx) in articleTags"
                  :key="idx"
                  :to="`/blog/tag/${tag.trim().toLowerCase().replace(/\\s+/g, '-')}`"
                  class="tag-badge"
                  :title="`View all articles tagged with ${tag}`"
                >
                  #{{ tag.trim().toLowerCase() }}
                </router-link>
              </div>
            </div>

          </article>

          <nav v-if="prevPost || nextPost" class="post-navigation-grid">
            <router-link v-if="prevPost" :to="`/blog/${prevPost.slug}`" class="nav-card prev-card text-decoration-none card-glass">
              <span class="nav-label"><i class="mdi mdi-arrow-left mr-1"></i> Previous Post</span>
              <h3 class="nav-title line-clamp-1">{{ prevPost.title }}</h3>
            </router-link>
            <div v-else class="nav-empty"></div>

            <router-link v-if="nextPost" :to="`/blog/${nextPost.slug}`" class="nav-card next-card text-decoration-none card-glass text-right">
              <span class="nav-label">Next Post <i class="mdi mdi-arrow-right ml-1"></i></span>
              <h3 class="nav-title line-clamp-1">{{ nextPost.title }}</h3>
            </router-link>
            <div v-else class="nav-empty"></div>
          </nav>
        </div>

        <aside class="right-sidebar-widgets">
          <div class="sticky-sidebar-inner">

            <div class="sidebar-widget">
              <div class="section-title-wrapper mb-4">
                <div class="news-badge-main mb-2">ENGAGEMENT</div>
                <h2 class="section-title text-sm">Share Protocol</h2>
                <div class="title-line"></div>
              </div>
              <div class="share-grid">
                <button @click="shareTo('whatsapp')" class="share-btn wa" title="Share to WhatsApp"><i class="mdi mdi-whatsapp"></i></button>
                <button @click="shareTo('x')" class="share-btn x-com" title="Share to X"><i class="mdi mdi-twitter"></i></button>
                <button @click="shareTo('facebook')" class="share-btn fb" title="Share to Facebook"><i class="mdi mdi-facebook"></i></button>
                <button @click="shareTo('linkedin')" class="share-btn in" title="Share to LinkedIn"><i class="mdi mdi-linkedin"></i></button>
                <button @click="copyLink" class="share-btn link" title="Copy Link"><i class="mdi mdi-link-variant"></i></button>
              </div>
            </div>

            <div v-if="randomApps.length > 0" class="sidebar-widget">
              <div class="section-title-wrapper mb-4">
                <div class="news-badge-main mb-2">RECOMMENDED</div>
                <h2 class="section-title text-sm">Related Modules</h2>
                <div class="title-line"></div>
              </div>
              <div class="sidebar-apps-list">
                <router-link v-for="app in randomApps" :key="app.id" :to="`/flow/${app.slug || app.id}`" class="sidebar-app-item card-glass highlight-module-card text-decoration-none">
                  <div class="sidebar-app-icon">
                    <img :src="app.icon || '/assets/icons/app_default.svg'" :alt="app.name" loading="lazy" width="42" height="42" />
                  </div>
                  <div class="sidebar-app-info">
                    <h3 class="app-name line-clamp-1">{{ app.name }}</h3>
                    <p class="app-desc line-clamp-2">{{ app.description }}</p>
                  </div>
                </router-link>
              </div>
            </div>

            <div v-if="recentPosts.length > 0" class="sidebar-widget">
              <div class="section-title-wrapper mb-4">
                <div class="news-badge-main mb-2">{{ isRelatedPostActive ? 'RECOMMENDED' : 'ARCHIVES' }}</div>
                <h2 class="section-title text-sm">{{ isRelatedPostActive ? 'Related Posts' : 'Recent Posts' }}</h2>
                <div class="title-line"></div>
              </div>
              <div class="sidebar-posts-list">
                <router-link v-for="post in recentPosts" :key="post.slug" :to="`/blog/${post.slug}`" class="sidebar-post-item card-glass text-decoration-none">
                  <div class="sidebar-post-img">
                     <img :src="post.cover || '/images/cover.webp'" :alt="post.title" class="news-img" loading="lazy" width="320" height="180" />
                  </div>
                  <div class="sidebar-post-content">
                    <div class="news-meta mb-1"><span>{{ post.date }}</span></div>
                    <h3 class="sidebar-post-title line-clamp-2">{{ post.title }}</h3>
                  </div>
                </router-link>
              </div>
            </div>

          </div>
        </aside>

      </div>

      <div class="super-footer-spacer"></div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '@/store/ui';
import fm from 'front-matter';
import { marked } from 'marked';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const scrollContainer = ref(null);

const loading = ref(true);
const error = ref(false);
const htmlContent = ref('');
const meta = ref({});
const recentPosts = ref([]);
const prevPost = ref(null);
const nextPost = ref(null);
const randomApps = ref([]);

const articleTags = ref([]);
const isRelatedPostActive = ref(false);

const themeStyles = computed(() => {
  const theme = uiStore.currentTheme;
  if (theme === 'light') {
    return { '--bg': '#f8fafc', '--text': '#0f172a', '--text-mute': '#475569', '--accent-1': '#e11d48', '--accent-2': '#06b6d4', '--glass': 'rgba(255, 255, 255, 0.85)', '--border': 'rgba(0, 0, 0, 0.1)', '--blob-1': '#0ea5e9', '--blob-2': '#eab308' };
  } else if (theme === 'hacker') {
     return { '--bg': '#000000', '--text': '#00ff00', '--text-mute': '#008f00', '--accent-1': '#00ff00', '--accent-2': '#00ff00', '--glass': 'rgba(0, 20, 0, 0.8)', '--border': 'rgba(0, 255, 0, 0.3)', '--blob-1': '#002200', '--blob-2': '#004400' };
  } else {
    return { '--bg': '#020204', '--text': '#ffffff', '--text-mute': '#94a3b8', '--accent-1': '#e11d48', '--accent-2': '#2dd4bf', '--glass': 'rgba(20, 20, 30, 0.85)', '--border': 'rgba(255, 255, 255, 0.15)', '--blob-1': '#22d3ee', '--blob-2': '#ffd700' };
  }
});

const shareTo = (plat) => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent(meta.value.title);
  const links = {
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
  };
  window.open(links[plat], '_blank');
};

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href);
  alert('Link copied to clipboard!');
};

// FUNGSI COPY SELURUH ARTIKEL
const copyArticleText = () => {
  const articleEl = document.querySelector('.markdown-body');
  if (articleEl) {
    navigator.clipboard.writeText(articleEl.innerText).then(() => {
      alert('Article text copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  }
};

// FUNGSI INJEKSI TOMBOL COPY PADA SETIAP BLOK KODE
const addCopyButtonsToCodeBlocks = () => {
  const blocks = document.querySelectorAll('.markdown-body pre');
  blocks.forEach((block) => {
    // Hindari duplikasi jika fungsi terpanggil berkali-kali
    if (block.querySelector('.copy-code-btn')) return;

    const btn = document.createElement('button');
    btn.className = 'copy-code-btn';
    btn.innerHTML = '<i class="mdi mdi-content-copy"></i>';
    btn.title = 'Copy code';

    btn.onclick = () => {
      // Ambil text dari <code> jika ada, atau dari <pre> secara langsung
      const codeEl = block.querySelector('code');
      const codeText = codeEl ? codeEl.innerText : block.innerText;

      navigator.clipboard.writeText(codeText).then(() => {
        btn.innerHTML = '<i class="mdi mdi-check"></i>';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.innerHTML = '<i class="mdi mdi-content-copy"></i>';
          btn.classList.remove('copied');
        }, 2000);
      });
    };

    block.appendChild(btn);
  });
};

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const handleLinkClick = (e) => {
  const target = e.target.closest('a.internal-link');
  if (target) {
    e.preventDefault();
    const path = target.getAttribute('href');
    if (path) router.push(path);
  }
};

const sanitizeAIFingerprint = (text) => {
  const zeroWidthRegex = /[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E\u2060-\u2064]/g;
  return text.replace(zeroWidthRegex, '');
};

const fetchContextData = async (currentSlug) => {
  try {
    const res = await fetch('/content/blog/index.json', { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      const sortedData = data.sort((a, b) => new Date(b.date) - new Date(a.date));
      const currentIndex = sortedData.findIndex(p => p.slug === currentSlug);

      if (currentIndex !== -1) {
          prevPost.value = currentIndex < sortedData.length - 1 ? sortedData[currentIndex + 1] : null;
          nextPost.value = currentIndex > 0 ? sortedData[currentIndex - 1] : null;

          const currentPostData = sortedData[currentIndex];
          if (currentPostData && currentPostData.keywords) {
             articleTags.value = currentPostData.keywords;
          } else {
             articleTags.value = [];
          }

          const currentTags = articleTags.value.map(k => k.trim().toLowerCase());
          let relatedPool = [];

          sortedData.forEach(post => {
             if (post.slug !== currentSlug) {
                let score = 0;
                const postTags = (post.keywords || []).map(k => k.trim().toLowerCase());

                postTags.forEach(tag => {
                   if (currentTags.includes(tag)) {
                      score += 10;
                   }
                });

                if (score > 0) {
                   post.relevanceScore = score + Math.random();
                   relatedPool.push(post);
                }
             }
          });

          if (relatedPool.length > 0) {
             relatedPool.sort((a, b) => b.relevanceScore - a.relevanceScore);
             recentPosts.value = relatedPool.slice(0, 3);
             isRelatedPostActive.value = true;
          } else {
             recentPosts.value = sortedData.filter(p => p.slug !== currentSlug).slice(0, 3);
             isRelatedPostActive.value = false;
          }
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent.value, 'text/html');
      let keywordMap = {};

      data.forEach(post => {
        if (post.slug !== currentSlug && post.keywords && Array.isArray(post.keywords)) {
          post.keywords.forEach(keyword => {
            let k = keyword.trim().toLowerCase();
            if (k.length > 2) {
              if (!keywordMap[k]) keywordMap[k] = [];
              keywordMap[k].push({ uid: `blog-${post.slug}`, url: `/blog/${post.slug}`, title: post.title });
            }
          });
        }
      });

      try {
        const flowRes = await fetch('/store/registry.json', { cache: 'force-cache' });
        if (flowRes.ok) {
          const flowRaw = await flowRes.json();
          const flowApps = Array.isArray(flowRaw) ? flowRaw : (flowRaw.apps || []);

          flowApps.forEach(app => {
            if (app.seo && Array.isArray(app.seo.keywords)) {
              app.seo.keywords.forEach(keyword => {
                let k = keyword.trim().toLowerCase();
                if (k.length > 2) {
                  if (!keywordMap[k]) keywordMap[k] = [];
                  keywordMap[k].push({ uid: `flow-${app.slug || app.id}`, url: `/flow/${app.slug || app.id}`, title: app.seo.title || app.name });
                }
              });
            }
          });
        }
      } catch (e) {
        console.error("Gagal menyerap data SEO Flow Registry:", e);
      }

      let usedKeywords = new Set();
      let postLinkCount = {};

      // LOGIKA TAMBAHAN: Tentukan path blog saat ini untuk pengecekan self-linking
      const currentBlogPath = `/blog/${currentSlug}`;

      const processTextNode = (node) => {
        let availableKeywords = Object.keys(keywordMap)
          .filter(k => !usedKeywords.has(k))
          .sort((a, b) => b.length - a.length);

        for (let k of availableKeywords) {
          const regex = new RegExp(`\\b(${escapeRegExp(k)})\\b`, 'i');
          const match = node.nodeValue.match(regex);

          if (match) {
            let candidates = keywordMap[k];

            // LOGIKA BARU: Filter kandidat agar tidak nge-link ke URL yang sama dengan blog ini
            let validCandidates = candidates.filter(c => c.url !== currentBlogPath);

            // Jika setelah difilter tidak ada kandidat tersisa, lewati keyword ini
            if (validCandidates.length === 0) continue;

            validCandidates.sort((a, b) => (postLinkCount[a.uid] || 0) - (postLinkCount[b.uid] || 0));
            let chosen = validCandidates[0];

            usedKeywords.add(k);
            postLinkCount[chosen.uid] = (postLinkCount[chosen.uid] || 0) + 1;

            const frag = document.createDocumentFragment();
            const offset = match.index;
            const matchedText = match[0];

            const beforeText = node.nodeValue.slice(0, offset);
            const afterText = node.nodeValue.slice(offset + matchedText.length);

            if (beforeText) {
              frag.appendChild(document.createTextNode(beforeText));
            }

            const a = document.createElement('a');
            a.href = chosen.url;
            a.className = 'internal-link';
            a.title = chosen.title;
            a.textContent = matchedText;
            frag.appendChild(a);

            if (afterText) {
              const afterNode = document.createTextNode(afterText);
              frag.appendChild(afterNode);
              processTextNode(afterNode);
            }

            node.parentNode.replaceChild(frag, node);
            return;
          }
        }
      };

      const walkDOM = (node) => {
        if (node.nodeType === 3) {
          processTextNode(node);
        } else if (node.nodeType === 1) {
          const excludedTags = ['A', 'SCRIPT', 'PRE', 'CODE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
          if (!excludedTags.includes(node.nodeName.toUpperCase())) {
            Array.from(node.childNodes).forEach(child => walkDOM(child));
          }
        }
      };

      walkDOM(doc.body);
      htmlContent.value = doc.body.innerHTML;

      // Panggil injector tombol copy setelah DOM termutasi oleh internal linker
      await nextTick();
      addCopyButtonsToCodeBlocks();
    }
  } catch (e) {
    console.error("Context fetch error:", e);
  }
};

const fetchContextualApps = async (articleKeywords, rawMarkdownText) => {
  try {
    const res = await fetch('/store/registry.json', { cache: 'force-cache' });
    if (res.ok) {
      const data = await res.json();
      let appsList = Array.isArray(data) ? data : (data.apps || []);

      const textToSearch = (rawMarkdownText || '').toLowerCase();
      const artTags = (articleKeywords || []).map(k => k.trim().toLowerCase());

      let strictlyRelevantApps = [];

      appsList.forEach(app => {
        let baseScore = 0;
        const appKeywords = (app.seo && app.seo.keywords) ? app.seo.keywords.map(k => k.trim().toLowerCase()) : [];

        appKeywords.forEach(appKey => {
          if (artTags.includes(appKey)) {
            baseScore += 10;
          }
          else if (textToSearch.includes(appKey)) {
            baseScore += 2;
          }
        });

        if (baseScore > 0) {
          app.relevanceScore = baseScore + Math.random();
          strictlyRelevantApps.push(app);
        }
      });

      strictlyRelevantApps.sort((a, b) => b.relevanceScore - a.relevanceScore);
      randomApps.value = strictlyRelevantApps.slice(0, 4);
    }
  } catch (e) {
    console.error("Gagal load Contextual Apps", e);
  }
};

const fetchMarkdown = async (slug) => {
  loading.value = true;
  error.value = false;
  try {
    let response = await fetch(`/content/blog/${slug}.md`, { cache: 'force-cache' });
    let rawText = '';

    if (response.ok) {
       rawText = await response.text();
    }

    if (!response.ok || rawText.trim().toLowerCase().startsWith('<!doctype html>') || rawText.trim().toLowerCase().startsWith('<html')) {
       console.warn(`[Fallback Engine] Proxy bypass aktif. Eksekusi raw_url Github untuk: ${slug}`);

       const idxRes = await fetch('/content/blog/index.json', { cache: 'force-cache' });
       if (idxRes.ok) {
          const idxData = await idxRes.json();
          const postMeta = idxData.find(p => p.slug === slug);

          if (postMeta && postMeta.raw_url) {
              const ghRes = await fetch(postMeta.raw_url, { cache: 'force-cache' });
              if (!ghRes.ok) throw new Error('Github File Not Found');
              rawText = await ghRes.text();
          } else {
              throw new Error('Local Missing & No Github URL Provided');
          }
       } else {
          throw new Error('Index JSON Missing');
       }
    }

    if (!rawText || rawText.trim() === '') throw new Error('Document is empty');

    rawText = sanitizeAIFingerprint(rawText);

    const parsedData = fm(rawText);

    // FIX: Sanitasi meta cover agar tidak menyertakan whitespace atau karakter sisa AI
    if (parsedData.attributes.cover) {
       parsedData.attributes.cover = parsedData.attributes.cover.trim().replace(/^["']|["']$/g, '');
    }

    meta.value = parsedData.attributes;
    htmlContent.value = marked.parse(parsedData.body);

    // Inject tombol awal (berjaga-jaga bila fetchContextData lambat)
    await nextTick();
    addCopyButtonsToCodeBlocks();

    fetchContextualApps(parsedData.attributes.keywords || [], rawText);
    fetchContextData(slug);
  } catch (err) {
    console.error("Markdown Fetch Error:", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  uiStore.initTheme();
  if (route.params.slug) {
    fetchMarkdown(route.params.slug);
  }
});

watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    window.scrollTo(0,0);
    fetchMarkdown(newSlug);
  }
});
</script>

<style scoped>
.blog-wrapper { height: 100vh; overflow-y: auto; overflow-x: hidden; background: var(--bg); color: var(--text); font-family: 'Space Grotesk', sans-serif; position: relative; padding-top: 40px; scroll-behavior: smooth; transition: background 0.3s; }
.noise-overlay { position: fixed; inset: 0; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E"); pointer-events: none; z-index: 0; mix-blend-mode: overlay; }
.ambient-mesh { position: fixed; inset: 0; z-index: 0; filter: blur(150px); opacity: 0.5; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; animation: float 15s infinite ease-in-out; }
.b1 { width: 80vw; height: 80vw; background: var(--blob-1); top: -25%; left: -15%; opacity: 0.5; }
.b2 { width: 75vw; height: 75vw; background: var(--blob-2); bottom: -15%; right: -25%; opacity: 0.4; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.reader-container { position: relative; z-index: 10; max-width: 1400px; margin: 0 auto; padding: 0 40px; }
.reader-layout-grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 50px; align-items: start; }
.main-article-content { grid-column: 1; }
.right-sidebar-widgets { grid-column: 2; height: 100%; }
.sticky-sidebar-inner { position: sticky; top: 90px; display: flex; flex-direction: column; gap: 40px; }

/* UTILS */
.top-nav-bar { display: flex; }
.btn-outline { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--text); padding: 10px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: 0.2s; }
.btn-outline:hover { background: rgba(255,255,255,0.08); border-color: var(--accent-1); color: var(--accent-1);}
.card-glass { background: var(--glass); border: 1px solid var(--border); backdrop-filter: blur(16px); }
.text-decoration-none { text-decoration: none; color: inherit; display: block; }
.news-badge-main { display: inline-block; background: var(--text); color: var(--bg); font-weight: 800; font-size: 0.7rem; padding: 2px 8px; letter-spacing: 2px; text-transform: uppercase; }

/* BREADCRUMBS UI */
.breadcrumbs-ui { font-family: monospace; font-size: 0.9rem; }
.breadcrumb-link { color: var(--text-mute); text-decoration: none; transition: 0.2s; }
.breadcrumb-link:hover { color: var(--accent-2); }
.separator-icon { margin: 0 6px; color: var(--border); font-size: 1.1rem; vertical-align: middle; }
.breadcrumb-current { color: var(--text); font-weight: bold; }

/* SHARE GRID */
.share-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }
.share-btn { height: 45px; border-radius: 12px; border: 1px solid var(--border); background: var(--glass); color: var(--text); font-size: 1.2rem; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; }
.share-btn:hover { transform: translateY(-3px); color: #fff; }
.wa:hover { background: #25d366; border-color: #25d366; }
.x-com:hover { background: #000; border-color: #333; }
.fb:hover { background: #1877f2; border-color: #1877f2; }
.in:hover { background: #0077b5; border-color: #0077b5; }
.link:hover { background: var(--accent-1); border-color: var(--accent-1); }

/* SIDEBAR COMPONENTS */
.sidebar-widget { display: flex; flex-direction: column; }
.section-title.text-sm { font-size: 1.1rem; font-weight: 800; text-transform: uppercase; margin: 0 0 8px 0; color: var(--text); }
.title-line { width: 100%; height: 2px; background: var(--border); }
.sidebar-apps-list { display: flex; flex-direction: column; gap: 12px; }
.sidebar-app-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; transition: 0.3s; }
.sidebar-app-item:hover { border-color: var(--accent-2); transform: translateX(5px); }

/* Highlight Module Card (Android Green Accent) */
.highlight-module-card {
  border-left: 4px solid #3DDC84 !important;
  background: rgba(61, 220, 132, 0.05) !important;
}
.highlight-module-card:hover {
  background: rgba(61, 220, 132, 0.15) !important;
  border-color: #3DDC84 !important;
}
.highlight-module-card .app-name {
  color: #3DDC84;
}

.sidebar-app-icon { width: 42px; height: 42px; flex-shrink: 0; background: rgba(0,0,0,0.1); border-radius: 10px; padding: 5px; border: 1px solid var(--border); }
.sidebar-app-icon img { width: 100%; height: 100%; object-fit: contain; }
.app-name { font-size: 0.9rem; font-weight: 700; margin-bottom: 2px; transition: 0.3s; }
.app-desc { font-size: 0.75rem; color: var(--text-mute); margin: 0; line-height: 1.3; }

.sidebar-posts-list { display: flex; flex-direction: column; gap: 15px; }
.sidebar-post-item { border-radius: 12px; overflow: hidden; transition: 0.3s; }
.sidebar-post-item:hover { border-color: var(--accent-1); transform: translateY(-3px); }
.sidebar-post-img { width: 100%; aspect-ratio: 16/9; position: relative; }
.news-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.sidebar-post-content { padding: 12px; }
.sidebar-post-title { font-size: 0.95rem; font-weight: 700; line-height: 1.3; margin: 0; }
.news-meta { font-family: monospace; font-size: 0.7rem; color: var(--text-mute); text-transform: uppercase; }

/* ARTICLE STYLING */
.manifesto-glass-card { width: 100%; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4); background: var(--glass); border: 1px solid var(--border); }
.custom-padding { padding: 50px 60px; }
.mac-os-dots { display: flex; gap: 8px; align-items: center; margin-bottom: 30px;}
.mac-os-dots span { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
.mac-os-dots .red { background: #ff5f56; }
.mac-os-dots .yellow { background: #ffbd2e; }
.mac-os-dots .green { background: #27c93f; }
.manifesto-label { margin-left: 10px; font-family: monospace; font-size: 0.8rem; color: var(--text-mute); }
.article-header { border-bottom: 2px solid var(--border); padding-bottom: 30px; margin-bottom: 40px; }
.display-title { font-size: 3rem; line-height: 1.1; font-weight: 800; color: var(--text); }
.article-meta { font-family: monospace; font-size: 0.9rem; color: var(--text-mute); }
.accent-text { color: var(--accent-2); font-weight: bold; }
.article-cover { margin-top: 30px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border); background: #000; }
.article-cover img { width: 100%; height: auto; display: block; object-fit: cover; }

/* MARKDOWN STYLING & MOBILE OVERFLOW FIXES */
.markdown-body { font-size: 1.15rem; line-height: 1.8; color: var(--text-mute); word-wrap: break-word; overflow-wrap: break-word; }
.markdown-body :deep(h2) { color: var(--text); font-size: 1.8rem; border-bottom: 1px dashed var(--border); padding-bottom: 8px; margin-top: 2em; }
.markdown-body :deep(p) { margin-bottom: 1.5em; text-align: justify; }

/* STYLING UNTUK PRE CODE & COPY BUTTON BARU */
.markdown-body :deep(pre) {
  background: rgba(0,0,0,0.3);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid var(--border);
  margin: 2em 0;
  max-width: 100%;
  overflow-x: auto;
  white-space: pre;
  -webkit-overflow-scrolling: touch;
  position: relative; /* Wajib agar button bisa diposisikan secara absolute */
}
.markdown-body :deep(img) { max-width: 100%; height: auto; border-radius: 8px; display: block; margin: 0 auto; }
.markdown-body :deep(table) { width: 100%; max-width: 100%; overflow-x: auto; display: block; }

/* STYLE TOMBOL COPY DALAM KODE MARKDOWN */
.markdown-body :deep(.copy-code-btn) {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid var(--border);
  color: var(--text-mute);
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}
.markdown-body :deep(.copy-code-btn:hover) {
  background: var(--accent-1);
  color: #fff;
  border-color: var(--accent-1);
}
.markdown-body :deep(.copy-code-btn.copied) {
  background: var(--accent-2);
  color: #1e1b4b;
  border-color: var(--accent-2);
}

/* STYLE UNTUK AUTO-LINK / INTERNAL LINK */
.markdown-body :deep(a.internal-link) { color: var(--accent-2); font-weight: bold; text-decoration: none; border-bottom: 1px dashed var(--accent-2); transition: all 0.3s ease; cursor: pointer; }
.markdown-body :deep(a.internal-link:hover) { color: var(--accent-1); border-bottom: 1px solid var(--accent-1); background: rgba(255,255,255,0.05); }

/* STYLE UNTUK SEO TAGS SECTION */
.seo-tags-section { margin-top: 50px; padding-top: 30px; border-top: 1px dashed var(--border); }
.tags-title { display: block; font-family: monospace; font-size: 0.8rem; color: var(--text-mute); margin-bottom: 15px; font-weight: bold; letter-spacing: 1px; }
.tags-grid { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-badge { background: rgba(255,255,255,0.03); border: 1px solid var(--border); color: var(--accent-2); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-family: monospace; text-decoration: none; transition: all 0.3s ease; }
.tag-badge:hover { background: var(--accent-1); color: #fff; border-color: var(--accent-1); transform: translateY(-3px); box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3); }

/* POST NAV */
.post-navigation-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 80px; padding-top: 40px; border-top: 1px solid var(--border); }
.nav-card { padding: 20px; border-radius: 16px; transition: 0.3s; }
.nav-card:hover { border-color: var(--accent-1); transform: translateY(-3px); }
.nav-label { font-size: 0.75rem; text-transform: uppercase; color: var(--accent-1); font-weight: 800; display: block; margin-bottom: 8px; }
.nav-title { font-size: 1.1rem; margin: 0; color: var(--text); }

.super-footer-spacer { height: 250px; }
.line-clamp-1 { display: -webkit-box; -webkit-line-clamp: 1; line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* RESPONSIVE LAYOUT FIXES */
@media (max-width: 1100px) {
  .reader-layout-grid { display: flex; flex-direction: column; gap: 40px; }
  .main-article-content, .right-sidebar-widgets { width: 100%; grid-column: auto; }
  .sticky-sidebar-inner { position: static; display: grid; grid-template-columns: 1fr 1fr; }
}

@media (max-width: 768px) {
  .reader-container { padding: 0 20px; }
  .custom-padding { padding: 30px 20px; }
  .display-title { font-size: 2.2rem; }
  .sticky-sidebar-inner { display: flex; flex-direction: column; gap: 30px; }
  .post-navigation-grid { grid-template-columns: 1fr; gap: 15px;}
}

@media (max-width: 600px) {
  .reader-container { padding: 0 15px; }
  .custom-padding { padding: 25px 15px; }
  .display-title { font-size: 1.8rem; line-height: 1.2; }
  .article-meta { display: flex; flex-wrap: wrap; gap: 5px; line-height: 1.4; }
  .mac-os-dots { margin-bottom: 20px; }
  .share-grid { grid-template-columns: repeat(5, 1fr); gap: 6px; }
  .share-btn { height: 40px; font-size: 1rem; }
  .markdown-body { font-size: 1.05rem; }
  .tag-badge { font-size: 0.75rem; padding: 5px 10px; }
  .breadcrumbs-ui { font-size: 0.8rem; margin-top: 5px; }
}
</style>