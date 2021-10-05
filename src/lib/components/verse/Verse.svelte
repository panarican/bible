<div class="verse{flip ? ' verse--flip' : ''}">
    <div class="front" on:click={handleFlip}>
        <div class="front__content">{content}</div>
    </div>
    <div class="back">
        <div class="back__content">
            {#if title}
                <h3 class="title">{title}</h3>
            {/if}
            <div class="button-group">
                <button class="button button--back" on:click={handleFlipBack}>Back</button>
                <button class="button button--play" on:click={handleSpeak}>Play</button>
                <button class="button button--{heart ? 'minus' : 'plus'}" on:click={handleFavorite}>Heart</button>
            </div>
        </div>
    </div>
</div>
<script>
    import { results, count } from '$lib/stores.js';
    import { locale } from 'svelte-i18n';
    import { page } from '$app/stores';
    import { getFavorites } from '$lib/service.js';
    export let index = 0;
    export let content = '';
    export let title = '';
    export let heart = false;
    export let flip = false;
    let currentResults = [];
    let isFavoritePage = false;

    results.subscribe(value => currentResults = value);

    /**
     * Handle favorite
     */
    function handleFavorite() {
        isFavoritePage = $page.path === '/favorite' || $page.path === '/es/favorita';

        if (!isFavoritePage) {
            heart = !heart;
        }

        toggleFavorite(index);
    }

    /**
     * toggle favorites
     */
    function toggleFavorite(favorite) {
        let favorites = getFavorites();

        if (favorites.find(index => favorite === index) >= 0) {
            favorites = favorites.filter(index => !(favorite === index));
        } else {
            favorites.push(favorite);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));

        // re render results for favorite
        if (isFavoritePage) {
            for (let i = 0; i < currentResults.length; i++) {
                if (currentResults[i].index === index) {
                    currentResults.splice(i, 1);
                    break;
                }
            }

            // Update the store for results
            results.set(currentResults);
            count.set(currentResults.length)
        }
    }

    /**
     * Speak event when passage is clicked
     * @param {object} evt
     */
    async function handleSpeak(evt) {
        window.speechSynthesis.cancel();
        setTimeout(() => {
            const utterThis = new SpeechSynthesisUtterance(content.split(' (')[0]);
            const voices = window.speechSynthesis.getVoices().filter(({localService}) => localService).sort(function(a, b) {
                if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
            });
            const voice = voices.find(({lang}) => lang.startsWith(($locale === 'en' ? 'en-GB' : ($locale === 'es' ? 'es-ES' : $locale))));
            const voiceFallback = voices.find(({lang}) => lang.startsWith($locale));
            utterThis.voice = voice ? voice : voiceFallback;
            utterThis.pitch = 1;
            utterThis.rate = 1;
            window.speechSynthesis.speak(utterThis);
       }, 100);
    }

    /**
     * Handle flip
     * @param {object} evt
     */
    function handleFlip(evt) {
        evt.preventDefault();
        let currentVerse = 0;

        for (let i = 0; i < currentResults.length; i++) {
            if (currentResults[i].index === index) {
                currentVerse = i;
            }

            if (!currentResults[i].flip) {
                continue;
            }

            currentResults[i].flip = false;
        }

        currentResults[currentVerse].flip = true;
        currentResults[currentVerse].heart = isFavoritePage || getFavorites().find(value => value === index) >= 0;

        // Update the store for results
        results.set(currentResults);
    }

    /**
     * Handle flip back
     * @param {object} evt
     */
    function handleFlipBack(evt) {
        evt.preventDefault();
        flip = false;
    }
</script>

<style lang="scss">
  .verse {
    cursor: pointer;
    width: 100%;
    height: 100%;
    position: relative;
    perspective: 1000px;
    -webkit-perspective: 1000px;
    -moz-perspective: 1000px;
  }
  .verse--flip .front {
    z-index: 900;
    transform: rotateY(-180deg);
  }
  .verse--flip .back {
    opacity: 1;
    z-index: 1000;
    transform: rotateX(0deg) rotateY(0deg);
    visibility: visible;
  }
  .front,
  .back {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: calc(var(--spacing) / 3);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    width: 100%;
    height: 100%;
    min-height: 110px;
    text-align: center;
    -webkit-backface-visibility: hidden;
    transform-style: preserve-3d;
    backface-visibility: hidden;
    transition: all 0.4s ease-in-out;
    padding: calc(var(--spacing) / 1.5);
  }
  .front {
    background-color: #fff;
    position: relative;
    top: 0;
    z-index: 900;
    transform: rotateX(0deg) rotateY(0deg);
  }
  .back {
    opacity: 0;
    background-color: #333;
    color: #fff;
    height: inherit;
    position: absolute;
    top: 0;
    z-index: 1000;
    transform: rotateY(-180deg);
    visibility: hidden;
    user-select: none;
  }
  .title {
    font-weight: 500;
    font-size: 18px;
    margin: 0 0 10px;
  }
  .button {
    overflow: hidden;
    text-indent: -99999px;
    white-space: nowrap;
    border-radius: 100%;
    width: 40px;
    height: 40px;
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 60% auto;
    background-color: #bbb;
    appearance: none;
    border: none;
    margin: 0 5px;
    cursor: pointer;
    transition: all 0.25s ease-in-out;
  }
  .button:hover {
    transform: scale3d(1.1, 1.1, 1.1);
    background-color: #fff;
  }
  .button--play {
    background-image: url('/assets/images/play.svg');
    background-position: 60% 50%;
  }
  .button--map {
    background-image: url('/assets/images/map-pin.svg');
  }
  .button--plus {
    background-image: url('/assets/images/heart.svg');
  }
  .button--minus {
    background-image: url('/assets/images/heart-fill.svg');
  }
  .button--back {
    background-image: url('/assets/images/chevron-left.svg');
  }
</style>
