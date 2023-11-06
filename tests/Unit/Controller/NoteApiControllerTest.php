<?php
declare(strict_types=1);
// SPDX-FileCopyrightText: Pablo Hurtado Curbelo <h.curbelo25@gmail.com>
// SPDX-License-Identifier: AGPL-3.0-or-later

namespace OCA\ReportEnricher\Tests\Unit\Controller;

use OCA\ReportEnricher\Controller\NoteApiController;

class NoteApiControllerTest extends NoteControllerTest {
	public function setUp(): void {
		parent::setUp();
		$this->controller = new NoteApiController($this->request, $this->service, $this->userId);
	}
}
