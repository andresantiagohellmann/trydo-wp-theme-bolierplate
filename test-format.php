<?php
/**
 * Test file with formatting issues
 */

$wrapper_attributes = get_block_wrapper_attributes([
	'class' => 'test-class',
]);

ob_start();
?>
<header<?php echo $wrapper_attributes; ?>>
    <div class="the-container grid grid-cols-[auto_1fr] gap-8 bg-red-500 main-px">
        <div class="brand">logo</div>
        <nav class="nav flex justify-end">
            <button class="nav-button">menu</button>
            <div class="nav-container flex">
                <ul class="menu flex">
                    <li class="menu-item">Home</li>
                    <li class="menu-item">Sobre</li>
                    <li class="menu-item">Serviços</li>
                    <li class="menu-item">Contato</li>
                </ul>

                <ul class="i18n flex">
                    <li class="i18n-item">PT</li>
                    <li class="i18n-item">EN</li>
                </ul>
                <ul class="theme-toggle">
                    <li class="theme-toggle-item">Dark</li>
                    <li class="theme-toggle-item">Light</li>
                </ul>
                <a href="http://google.com" target="_blank" rel="noopener noreferrer">Diga olá <i class="ph-bold ph-heart"></i>

                </a>
            </div>
        </nav>
    </div>
</header>
<?php return ob_get_clean();
