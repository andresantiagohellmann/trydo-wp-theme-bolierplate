<?php
/**
 * Server-side render for the Nav Bar block.
 *
 * @param array $attributes Block attributes.
 * @param string $content Block content.
 * @param WP_Block $block Block instance.
 *
 * @return string
 */

$wrapper_attributes = get_block_wrapper_attributes([
	"class" => "wp-block-trydo-wp-theme-bolierplate-nav-bar",
]);

ob_start();
?>
<header <?php echo $wrapper_attributes; ?>>
    <div class="the-container grid grid-cols-[auto_1fr] gap-8 bg-red-500 main-px">
        <div class="brand">logo</div>
        <nav class="nav flex justify-end relative">
            <button class="nav-button relative z-60 w-12 h-10 bg-green-500 rounded-xl">
                <i class="ph ph-list"></i>
            </button>
            <div class="nav-container flex absolute flex-col bg-white z-50 pt-14 min-w-72 px-4 pb-4 rounded-2xl">
                <div class="nav-content bg-black/5 rounded-xl p-4">
                    <ul class='menu flex flex-col'>
                        <li class='menu-item'>Home</li>
                        <li class='menu-item'>Sobre</li>
                        <li class='menu-item'>Serviços</li>
                        <li class='menu-item'>Contato</li>
                    </ul>
                    <ul class='i18n flex gap-2'>
                        <li class="i18n-item">PT</li>
                        <li class="i18n-item">EN</li>
                    </ul>
                    <ul class='theme-toggle'>
                        <li class="theme-toggle-item">
                            <button>
                                <i class="ph ph-sun-dim"></i>
                            </button>
                        </li>
                        <li class="theme-toggle-item hidden">
                            <button>
                                <i class="ph ph-moon-stars"></i>
                            </button>
                        </li>
                    </ul>
                    <a href="http://google.com" target="_blank" rel="noopener noreferrer">
                        Diga olá
                        <i class="ph-bold ph-heart"></i>
                    </a>
                </div>
            </div>
        </nav>
    </div>
</header>
<?php return ob_get_clean();
