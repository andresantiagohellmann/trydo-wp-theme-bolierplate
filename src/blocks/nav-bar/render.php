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
    <div class="the-container grid grid-cols-[auto_1fr] gap-8 bg-red-500 main-px items-center dark:bg-black/60">
        <div class="brand">logo</div>
        <nav class="nav flex justify-end relative">
            <div class="nav-buttons lg:hidden flex gap-2">
                <a class="nav-whatsapp flex bg-success-light rounded-xl p-2 justify-center gap-2 items-center !no-underline font-emphasis italic text-sm w-12 h-10 text-success-bold"
                    href="http://google.com" target="_blank" rel="noopener noreferrer">
                    <div class="text-xl">
                        <i class="ph-fill ph-whatsapp-logo"></i>
                    </div>
                </a>

                <button
                    class="nav-button relative z-60 w-12 h-10 bg-white rounded-xl cursor-pointer flex items-center justify-center "
                    data-nav-bar="nav-button" aria-label="Toggle navigation menu">
                    <svg width="17" height="8" viewBox="0 0 17 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="17" height="2" rx="1" fill="black" data-nav-bar="nav-button-top" />
                        <rect y="6" width="17" height="2" rx="1" fill="black" data-nav-bar="nav-button-top" />
                    </svg>

                </button>
            </div>
            <div class="nav-container flex absolute flex-col bg-white z-50 pt-14 min-w-72 px-4 pb-4 rounded-2xl lg:relative lg:bg-transparent lg:p-0 lg:flex-row"
                data-nav-bar="nav-container">
                <div class="nav-content bg-black/5 rounded-xl p-4 flex flex-col lg:flex-row lg:gap-8 lg:p-2 lg:pl-8 lg:backdrop-blur-2xl lg:bg-black/50 lg:text-white"
                    data-nav-bar="nav-content">
                    <ul class='menu flex flex-col order-2 gap-2 lg:order-1 lg:flex-row lg:gap-6 lg:items-center'>
                        <li class='menu-item font-bold'>Home</li>
                        <li class='menu-item hover:text-primary-thin transition cursor-pointer'>Sobre</li>
                        <li class='menu-item hover:text-primary-thin transition cursor-pointer'>Serviços</li>
                        <li class='menu-item hover:text-primary-thin transition cursor-pointer'>Contato</li>
                    </ul>
                    <div class="nav-tools order-1 flex justify-between items-center mb-6 lg:order-2 lg:mb-0 lg:gap-4">
                        <ul class='i18n flex gap-2 text-sm bg-white p-2 rounded-lg lg:p-0 lg:bg-transparent'>
                            <li
                                class="i18n-item font-bold bg-black/5 px-2 py-1 rounded hover:text-primary-thin transition cursor-pointer">
                                PT</li>
                            <li
                                class="i18n-item bg-black/0 rounded px-2 py-1 hover:text-primary-thin transition cursor-pointer">
                                EN</li>
                        </ul>
                        <ul class='theme-toggle text-xl flex items-center justify-center'>
                            <li class="theme-toggle-item">
                                <button
                                    class='flex items-center justify-center hover:text-primary-thin transition cursor-pointer'>
                                    <i class="ph ph-sun-dim"></i>
                                </button>
                            </li>
                            <li class="theme-toggle-item hidden">
                                <button
                                    class='flex items-center justify-center hover:text-primary-thin transition cursor-pointer'>
                                    <i class="ph ph-moon-stars"></i>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="nav-contact order-3 flex justify-around gap-2 mt-6 lg:mt-0">
                        <a class="nav-contact-link flex bg-white p-3 rounded-lg !no-underline justify-center items-center text-xl lg:hidden"
                            href="">
                            <i class="ph ph-instagram-logo"></i>
                        </a>
                        <a class="nav-contact-link flex bg-white p-3 rounded-lg !no-underline justify-center items-center text-xl lg:hidden"
                            href="">
                            <i class="ph ph-envelope-simple"></i>
                        </a>

                        <a class="nav-whatsapp flex bg-success-light rounded-lg w-full p-2 justify-center gap-2 items-center !no-underline font-emphasis italic text-sm lg:px-3 text-success-bold hover:bg-success-bold hover:text-success-regular transition"
                            href="http://google.com" target="_blank" rel="noopener noreferrer">
                            <span class="whatsapp-text lg:hidden">
                                Diga olá
                            </span>
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
