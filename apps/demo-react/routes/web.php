<?php

use App\Livewire\DemoPage;
use App\Livewire\Pages;
use Illuminate\Support\Facades\Route;

Route::get('/', DemoPage::class)->name('home');

Route::get('/state', Pages\StatePage::class)->name('state');
Route::get('/wire', Pages\WirePage::class)->name('wire');
Route::get('/forms', Pages\FormsPage::class)->name('forms');
Route::get('/slots', Pages\SlotsPage::class)->name('slots');
Route::get('/uploads', Pages\UploadsPage::class)->name('uploads');
Route::get('/table', Pages\TablePage::class)->name('table');
Route::get('/charts', Pages\ChartsPage::class)->name('charts');
Route::get('/board', Pages\BoardPage::class)->name('board');
Route::get('/kanban', Pages\KanbanPage::class)->name('kanban');
Route::get('/architecture', Pages\ArchitecturePage::class)->name('architecture');
