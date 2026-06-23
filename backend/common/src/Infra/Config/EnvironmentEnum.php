<?php

declare(strict_types=1);

namespace Common\Infra\Config;

enum EnvironmentEnum: string
{
    case Dev = 'dev';
    case Test = 'test';
    case Prod = 'prod';
}
