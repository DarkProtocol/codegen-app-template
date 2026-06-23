<?php

declare(strict_types=1);

$root = dirname(__DIR__);

require_once $root . '/vendor/autoload.php';

if (empty($_ENV['ENVIRONMENT']) && class_exists(\Dotenv\Dotenv::class)) {
    \Dotenv\Dotenv::createImmutable($root)->safeLoad();
}
