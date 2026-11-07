package db

import (
	"database/sql"
    "errors"
    "crypto/rand"
    "encoding/hex"
    "os"
    "path/filepath"

	"blog/internal/model"
	"blog/internal/utils"
)

type ArticleRepo struct {
	DB *sql.DB
}

func (r *ArticleRepo) ListAll() ([]model.Article, error) {
	rows, err := r.DB.Query(`
		SELECT id, title, title_url, subject_id, is_public, html, created_at
		FROM articles
		ORDER BY id DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var articles []model.Article

	for rows.Next() {
		var a model.Article
		if err := rows.Scan(
			&a.ID,
			&a.Title,
            &a.TitleURL,
			&a.SubjectId,
            &a.IsPublic,
			&a.HTML,
			&a.CreatedAt,
		); err != nil {
			return nil, err
		}
		articles = append(articles, a)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return articles, nil
}

func (r *ArticleRepo) GetByID(id int64) (model.Article, error) {
	var a model.Article

	err := r.DB.QueryRow(`
		SELECT id, title, title_url, subject_id, is_public, html, created_at
		FROM articles
		WHERE id = ?
	`, id).Scan(
		&a.ID,
		&a.Title,
        &a.TitleURL,
		&a.SubjectId,
        &a.IsPublic,
		&a.HTML,
		&a.CreatedAt,
	)

	return a, err
}

func (r *ArticleRepo) ImportByID(id int64) (string, int64, bool, error) {
	var title string
    var subject_id int64
    var is_public bool

	err := r.DB.QueryRow(`
		SELECT title, subject_id, is_public
		FROM articles
		WHERE id = ?
	`, id).Scan(
		&title,
        &subject_id,
		&is_public,
	)

	return title, subject_id, is_public, err
}

func (r *ArticleRepo) GetHTMLByID(id int64) (string, error) {
	var html string

	err := r.DB.QueryRow(`
		SELECT html
		FROM articles
		WHERE id = ?
	`, id).Scan(&html)

	return html, err
}

//func (r *ArticleRepo) Update(
//    id int64,
//    title string,
//    subjectId int64,
//    is_public bool,
//    html string,
//) error {
//
//    _, err := r.DB.Exec(`
//        UPDATE articles
//        SET
//            title = ?,
//            title_url = CASE
//                WHEN ? THEN ?
//                ELSE title_url
//            END,
//            subject_id = ?,
//            html = ?,
//            is_public = ?
//        WHERE id = ?
//    `,
//        title,
//        is_public,
//        utils.Slugify(title),
//        subjectId,
//        html,
//        is_public,
//        id,
//    )
//
//    return err
//}


func (r *ArticleRepo) Update(
    id int64,
    title string,
    subjectId int64,
    is_public bool,
    html string,
) error {

    // 1. Retrieve the previous URL and visibility.
    var oldURL string
    var wasPublic bool

    err := r.DB.QueryRow(`
        SELECT title_url, is_public
        FROM articles
        WHERE id = ?
    `, id).Scan(&oldURL, &wasPublic)

    if err != nil {
        return err
    }

    // 2. Determine the new URL.
    newURL := oldURL

    if is_public {
        newURL = utils.Slugify(title)

    } else if wasPublic {
        // Public → Private: generate a random 64-character URL.
        b := make([]byte, 32)

        if _, err := rand.Read(b); err != nil {
            return err
        }

        newURL = hex.EncodeToString(b)
    }

    // 3. Update the database.
    _, err = r.DB.Exec(`
        UPDATE articles
        SET title = ?, title_url = ?, subject_id = ?, html = ?, is_public = ?
        WHERE id = ?
    `, title, newURL, subjectId, html, is_public, id)

    if err != nil {
        return err
    }

    // 4. Remove the old HTML file if the URL changed.
    if oldURL != newURL {
        oldFile := filepath.Join("dist", "articles", oldURL+".html")

        if err := os.Remove(oldFile); err != nil && !os.IsNotExist(err) {
            return err
        }
    }

    return nil
}



func (r *ArticleRepo) Delete(id int64) error {
	_, err := r.DB.Exec(
		`DELETE FROM articles WHERE id = ?`,
		id,
	)
	return err
}

func (r *ArticleRepo) Create(
    title string,
    subjectId int64,
    is_public bool,
    html string,
) (int64, error) {

    var titleURL string

    if is_public {
        titleURL = utils.Slugify(title)
    } else {
        b := make([]byte, 32)

        if _, err := rand.Read(b); err != nil {
            return 0, err
        }

        titleURL = hex.EncodeToString(b)
    }

    res, err := r.DB.Exec(`
        INSERT INTO articles (title, title_url, subject_id, html, is_public, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
    `, title, titleURL, subjectId, html, is_public)

    if err != nil {
        return 0, err
    }

    return res.LastInsertId()
}


func (r *ArticleRepo) GetDefaultSubjectID() (int64, error) {
	var id int64
    const DefaultSubjectSlug = "default"

	err := r.DB.QueryRow(`
		SELECT id
		FROM subjects
		WHERE slug = ?
	`, DefaultSubjectSlug).Scan(&id)

    if err != nil {
        return 0, err
    }

	return id, nil
}

func (r *ArticleRepo) ReslugAll() error {
	rows, err := r.DB.Query(`
		SELECT id, title
		FROM articles
	`)
	if err != nil {
		return err
	}
	defer rows.Close()

	tx, err := r.DB.Begin()
	if err != nil {
		return err
	}

	stmt, err := tx.Prepare(`
		UPDATE articles
		SET title_url = ?
		WHERE id = ?
	`)
	if err != nil {
		tx.Rollback()
		return err
	}
	defer stmt.Close()

	for rows.Next() {
		var id int64
		var title string

		if err := rows.Scan(&id, &title); err != nil {
			tx.Rollback()
			return err
		}

		slug := utils.Slugify(title)

		if _, err := stmt.Exec(slug, id); err != nil {
			tx.Rollback()
			return err
		}
	}

	if err := rows.Err(); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit()
}


func (r *ArticleRepo) ExistsByTitle(title string, id int64) (bool, error) {
	var exists int

	err := r.DB.QueryRow(`
		SELECT 1
		FROM articles
		WHERE title_url = ? AND id != ?
        LIMIT 1
	`, utils.Slugify(title), id).Scan(&exists)

	if err != nil {
        if (errors.Is(err, sql.ErrNoRows)) {
    	    return false, nil
        }
		return false, err
	}

	return true, nil
}

func (r *ArticleRepo) ExistsByTitleRaw(title string) (bool, error) {
	var exists int

	err := r.DB.QueryRow(`
		SELECT 1
		FROM articles
		WHERE title_url = ?
        LIMIT 1
	`, utils.Slugify(title)).Scan(&exists)

	if err != nil {
        if (errors.Is(err, sql.ErrNoRows)) {
    	    return false, nil
        }
		return false, err
	}

	return true, nil
}

func (r *ArticleRepo) GetByTitleURL(title_url string) (model.Article, error) {
	var a model.Article

	err := r.DB.QueryRow(`
		SELECT id, title, title_url, subject_id, is_public, html, created_at
		FROM articles
		WHERE title_url = ?
	`, title_url).Scan(
		&a.ID,
		&a.Title,
        &a.TitleURL,
		&a.SubjectId,
        &a.IsPublic,
		&a.HTML,
		&a.CreatedAt,
	)

	return a, err
}

func (r *ArticleRepo) ListIDAndTitle() ([]struct {
	ID    int64
	Title string
}, error) {

	rows, err := r.DB.Query(`
		SELECT id, title
		FROM articles
		ORDER BY id DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []struct {
		ID    int64
		Title string
	}

	for rows.Next() {
		var id int64
		var title string

		if err := rows.Scan(&id, &title); err != nil {
			return nil, err
		}

		result = append(result, struct {
			ID    int64
			Title string
		}{
			ID:    id,
			Title: title,
		})
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return result, nil
}

func (r *ArticleRepo) GetTitleURLByTitle(title string) (string, error) {
    var titleURL string

    err := r.DB.QueryRow(`
        SELECT title_url
        FROM articles
        WHERE title = ?
    `, title).Scan(&titleURL)

    return titleURL, err
}



