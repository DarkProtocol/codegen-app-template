<?php

declare(strict_types=1);

namespace AdminApi\Controller;

use Common\Shared\Http\Exception\InternalException;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\StreamFactoryInterface;

final readonly class DocsController
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory,
    ) {}

    public function index(): ResponseInterface
    {
        return $this->html(<<<'HTML'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>App API Docs</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    window.addEventListener('load', () => {
      window.ui = SwaggerUIBundle({
        url: '/docs/openapi.yml',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
      });
    });
  </script>
</body>
</html>
HTML);
    }

    public function openapi(): ResponseInterface
    {
        $content = file_get_contents($this->openapiPath());
        if ($content === false) {
            throw new InternalException('OpenAPI specification is not available.');
        }

        return $this->responseFactory->createResponse()
            ->withHeader('Content-Type', 'application/yaml; charset=UTF-8')
            ->withBody($this->streamFactory->createStream($content));
    }

    private function html(string $content): ResponseInterface
    {
        return $this->responseFactory->createResponse()
            ->withHeader('Content-Type', 'text/html; charset=UTF-8')
            ->withBody($this->streamFactory->createStream($content));
    }

    private function openapiPath(): string
    {
        return dirname(__DIR__, 2) . '/web/openapi.yml';
    }
}
