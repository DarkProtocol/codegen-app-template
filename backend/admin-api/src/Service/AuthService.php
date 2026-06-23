<?php

declare(strict_types=1);

namespace AdminApi\Service;

use Common\App\Models\AdminUser;
use Common\Infra\Config\Config;
use Common\Shared\Exception\ValidationException;
use Common\Shared\ValueObject\Uuid;
use DateInterval;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ServerRequestInterface;
use Psr\SimpleCache\CacheInterface;
use stdClass;
use Throwable;
use Yiisoft\Cookies\Cookie;
use Yiisoft\Cookies\CookieCollection;

final readonly class AuthService
{
    private const ALGORITHM = 'HS256';
    private const COOKIE_NAME = 'adminJwt';
    private const TTL = 60 * 60 * 24 * 7; // 7 days
    private const REFRESH_BEFORE = 60 * 60 * 24 * 6; // 6 days
    private const MAX_LOGIN_ATTEMPTS = 10;
    private const LOGIN_ATTEMPT_TTL = 60 * 30; // 30 minutes
    private const LOGIN_ATTEMPT_KEY_PREFIX = 'admin_login_attempts_';
    private string $secret;

    public function __construct(
        private Config $config,
        private CacheInterface $cache,
    ) {
        $this->secret = $config->mustString('ADMIN_AUTH_JWT_SECRET');
    }

    public function getJwt(CookieCollection $cookies): ?string
    {
        $jwt = $cookies->getValue(self::COOKIE_NAME);

        return $jwt === '' ? null : $jwt;
    }

    public function getUserId(string $jwt): ?Uuid
    {
        $payload = $this->decode($jwt);
        if ($payload === null || !isset($payload->sub) || !is_scalar($payload->sub)) {
            return null;
        }

        try {
            return new Uuid((string) $payload->sub);
        } catch (ValidationException) {
            return null;
        }
    }

    public function shouldRefresh(string $jwt): bool
    {
        $payload = $this->decode($jwt);
        if ($payload === null || !isset($payload->exp) || !is_numeric($payload->exp)) {
            return false;
        }

        return (int) $payload->exp - time() <= self::REFRESH_BEFORE;
    }

    public function login(AdminUser $user, ServerRequestInterface $request): Cookie
    {
        $this->ensureLoginAttemptsAllowed($user);
        $this->resetLoginAttempts($user);

        return $this->generateCookie($user, $request);
    }

    public function generateCookie(AdminUser $user, ?ServerRequestInterface $request = null): Cookie
    {
        $now = time();
        $exp = $now + self::TTL;
        $jwt = JWT::encode(
            [
                'sub' => $user->getId()->value(),
                'iat' => $now,
                'exp' => $exp,
            ],
            $this->secret,
            self::ALGORITHM,
        );

        $cookie = new Cookie(self::COOKIE_NAME, $jwt)
            ->withPath('/')
            ->withHttpOnly(true)
            ->withMaxAge(new DateInterval('PT' . self::TTL . 'S'))
            ->withSameSite(Cookie::SAME_SITE_LAX)
            ->withSecure(!$this->config->isDev());

        if ($request !== null) {
            $cookie = $this->applyCookieDomain($cookie, $request);
        }

        return $cookie;
    }

    public function generateExpiredCookie(ServerRequestInterface $request): Cookie
    {
        $cookie = new Cookie(self::COOKIE_NAME)
            ->withPath('/')
            ->withHttpOnly(true)
            ->withSameSite(Cookie::SAME_SITE_LAX)
            ->withSecure(!$this->config->isDev())
            ->expire();

        return $this->applyCookieDomain($cookie, $request);
    }

    private function decode(string $jwt): ?stdClass
    {
        try {
            return JWT::decode($jwt, new Key($this->secret, self::ALGORITHM));
        } catch (Throwable) {
            return null;
        }
    }

    public function ensureLoginAttemptsAllowed(AdminUser $user): void
    {
        if ($this->loginAttempts($user) > self::MAX_LOGIN_ATTEMPTS) {
            throw new ValidationException('auth.too_many_login_attempts', field: 'email');
        }
    }

    public function registerFailedLoginAttempt(AdminUser $user): void
    {
        $attempts = $this->loginAttempts($user) + 1;
        $this->cache->set($this->loginAttemptsKey($user), $attempts, self::LOGIN_ATTEMPT_TTL);

        if ($attempts > self::MAX_LOGIN_ATTEMPTS) {
            throw new ValidationException('auth.too_many_login_attempts', field: 'email');
        }
    }

    private function resetLoginAttempts(AdminUser $user): void
    {
        $this->cache->delete($this->loginAttemptsKey($user));
    }

    private function loginAttempts(AdminUser $user): int
    {
        return (int) $this->cache->get($this->loginAttemptsKey($user), 0);
    }

    private function loginAttemptsKey(AdminUser $user): string
    {
        return self::LOGIN_ATTEMPT_KEY_PREFIX . hash('sha256', $user->getEmail()->value());
    }

    private function getRootDomain(string $host): ?string
    {
        if ($host === '' || $host === 'localhost' || filter_var($host, FILTER_VALIDATE_IP)) {
            return null;
        }

        $parts = explode('.', $host);

        if (count($parts) <= 2) {
            return $host;
        }

        $root = array_slice($parts, -2);
        return '.' . implode('.', $root);
    }

    private function applyCookieDomain(Cookie $cookie, ServerRequestInterface $request): Cookie
    {
        if ($this->config->isDev()) {
            return $cookie;
        }

        $domain = $this->getRootDomain($request->getUri()->getHost());

        return $domain === null ? $cookie : $cookie->withDomain($domain);
    }
}
