## Редактирование Объема транзакций

1. Понадобится  объект `volume` в `assets/content/content.json` 
   
2. Отредактировать значение `instantTradesVolume` (`bridgeVolume`) для объема инстант трейдс (кросс-чейн свапов)

## Добавление и редактирование команды

1. Добавить нужное изобаржение в папку
   ```assets/images/team```

2. Добавить записть в `assets/content/content.json` в массив `taem`

Формат записи:
```
{
    "img": string (имя файла нужного изображения с расширением),
    "name": string (имя и фамилия),
    "role": srting (позиция),
    "links": Array<
          {
            "icon": string (имя файла с иконкой в папке assets/images/icons/social),
            "url": string (ссылка)
          }
      >
    
  }
```

## Добавление и редактирование достижений

1. Добавить нужное изобаржение в папку
   ```assets/images/icons/collaborations```

2. Добавить записть в `assets/content/content.json` в массив `collaborations`

Формат записи:
```
{
    "img": string (имя файла нужного изображения с расширением),
    "url": string (ссылка)
}
```


