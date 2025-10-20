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
	'class' => 'wp-block-trydo-wp-theme-bolierplate-nav-bar',
]);

ob_start();
?>
<header <?php echo $wrapper_attributes; ?> data-nav-bar="wrapper">
    <div class="the-container grid grid-cols-[auto_1fr] gap-8 bg-red-500 main-px">
        <div class="brand">logo</div>
        <nav class="nav flex justify-end relative">
            <button
                class="nav-button relative z-60 w-12 h-10 bg-white rounded-xl cursor-pointer flex items-center justify-center"
                data-nav-bar="nav-button" aria-label="Toggle navigation menu">
                <svg width="17" height="8" viewBox="0 0 17 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="17" height="2" rx="1" fill="black" data-nav-bar="nav-button-top" />
                    <rect y="6" width="17" height="2" rx="1" fill="black" data-nav-bar="nav-button-top" />
                </svg>

            </button>
            <div class="nav-container flex absolute flex-col bg-white z-50 pt-14 min-w-72 px-4 pb-4 rounded-2xl"
                data-nav-bar="nav-container">
                <div class="nav-content bg-black/5 rounded-xl p-4 flex flex-col" data-nav-bar="nav-content">
                    <ul class='menu flex flex-col order-2 gap-2'>
                        <li class='menu-item font-bold'>Home</li>
                        <li class='menu-item'>Sobre</li>
                        <li class='menu-item'>Serviços</li>
                        <li class='menu-item'>Contato</li>
                    </ul>
                    <div class="nav-tools order-1 flex justify-between items-center mb-6">
                        <ul class='i18n flex gap-2 text-sm bg-white p-2 rounded-lg'>
                            <li class="i18n-item font-bold bg-black/5 px-2 py-1 rounded">PT</li>
                            <li class="i18n-item bg-black/0 rounded px-2 py-1">EN</li>
                        </ul>
                        <ul class='theme-toggle text-xl'>
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
                    </div>
                    <div class="nav-contact order-3 flex justify-around gap-2 mt-6">
                        <a class="nav-contact-link flex bg-white p-3 rounded-lg !no-underline justify-center items-center text-xl"
                            href="">
                            <i class="ph ph-instagram-logo"></i>
                        </a>
                        <a class="nav-contact-link flex bg-white p-3 rounded-lg !no-underline justify-center items-center text-xl"
                            href="">
                            <i class="ph ph-envelope-simple"></i>
                        </a>

                        <a class="nav-whatsapp flex bg-success-light rounded-lg w-full p-2 justify-center gap-2 items-center !no-underline font-emphasis italic text-sm"
                            href="http://google.com" target="_blank" rel="noopener noreferrer">
                            Diga olá
                            <div class="text-xl">
                                <i class="ph-fill ph-whatsapp-logo"></i>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    </div>
</header>
<?php return ob_get_clean();
