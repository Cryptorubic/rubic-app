## Добавление и редактирование команды

1. Добавить нужное изобаржение в папку
   ```assets/images/team```

2. Добавить записть в ```assets/content/team/team.json```

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


