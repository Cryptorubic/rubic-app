## Редактирование Объема транзакций

1. Понадобится  объект `volume` в `assets/content/content.json` 
   
2. Отредактировать значение `instantTradesVolume` (`bridgeVolume`) для объема инстант трейдс (кросс-чейн свапов)

## Добавление и редактирование достижений

1. Добавить нужное изображение в папку
   ```assets/images/icons/collaborations```

2. Добавить запись в `assets/content/content.json` в массив `collaborations`

Формат записи:
```
{
    "img": string (имя файла нужного изображения с расширением),
    "url": string (ссылка)
}
```


