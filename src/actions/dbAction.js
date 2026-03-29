'use server';

import ddb from '@/utils/db/mysql';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function getTableData(table) {
  try {
    const [rows] = await ddb.query('SELECT * FROM ??', [table]);
    return rows;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getNavbar(route) {
  try {
    const [rows] = await ddb.query(`SELECT des,keyword,FAQ FROM navbar WHERE url_id = ? LIMIT 1`, [
      route,
    ]);
    return rows[0] || null;
  } catch (error) {
    console.error('Navbar Fetch Error:', error);
    return null;
  }
}

export async function getMeta(table, route) {
  const [rows] = await ddb.query(`SELECT metadata FROM ?? WHERE route = ? LIMIT 1`, [table, route]);

  const meta = rows[0]?.metadata;
  const dbSlug = rows[0]?.slug;

  return {
    metadata: meta,
    dbSlug: dbSlug,
  };
}

export async function getPageContent(table, url_id) {
  const [rows] = await ddb.query(
    `SELECT urlName,route,des,bottom_des,keyword,FAQ ,code,content FROM ?? WHERE url_id = ? LIMIT 1`,
    [table, url_id]
  );
  const data = rows[0] || null;
  return {
    data: {
      urlName: data?.urlName || '',
      image: data?.image || '',
      des: data?.des || '',
      route: data?.route || '',
      keyword: data?.keyword || '',
      bottom_des: data?.bottom_des || '',

       content: (() => {
        try {
          return data?.content ? JSON.parse(data.content) : [];
        } catch {
          return [];
        }
      })(),

        code: (() => {
        try {
          return data?.code ? JSON.parse(data.code) : [];
        } catch {
          return [];
        }
      })(),
      // ✅ parse JSON safely
      faq: (() => {
        try {
          return data?.FAQ ? JSON.parse(data.FAQ) : [];
        } catch {
          return [];
        }
      })(),
    },
  };
}

export async function UpdatePageContent(table, url_id, data) {
  const { urlName, route, des, bottom_des, keyword, faq, code, content } = data;
  try {
    const [result] = await ddb.query(
      `
      UPDATE ??
      SET urlName=?, route=?, des=?, bottom_des=?, keyword=?, FAQ=?, code=?, content=?
      WHERE url_id=?
      `,
      [
        table,
        urlName,
        route,
        des,
        bottom_des,
        keyword,
        JSON.stringify(faq ?? []),
        JSON.stringify(code ?? []),
        JSON.stringify(content ?? []),
        url_id,
      ]
    );
    return {
      success: true,
      message: 'Record updated successfully',
    };
  } catch (error) {
    console.error('Update record error:', error);
    return {
      success: false,
      message: error.message || 'Something went wrong',
    };
  }
}
export async function addNewRecord(data) {
  try {
    const { category, url_id, urlName, route, des, keyword, metaData } = data;

    const [result] = await ddb.query(
      `
      INSERT INTO ??
      (url_id, urlName, route, des, keyword, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [category, url_id, urlName, route, des, keyword, metaData]
    );

    // ✅ SUCCESS RESPONSE
    return {
      success: true,
      message: 'Record added successfully',
    };
  } catch (error) {
    console.error('Add record error:', error);

    // ❌ ERROR RESPONSE
    return {
      success: false,
      message: error.message || 'Something went wrong',
    };
  }
}

export async function deleteRecord(url_id, table) {
  try {
    if (!url_id) {
      return {
        success: false,
        message: 'url_id is required',
      };
    }

    const [result] = await ddb.query(
      `
      DELETE FROM ??
      WHERE url_id = ?
      `,
      [table, url_id]
    );

    if (!result || result.affectedRows === 0) {
      return {
        success: false,
        message: 'Record not found',
      };
    }

    return {
      success: true,
      message: 'Record deleted successfully',
    };
  } catch (error) {
    console.error('Delete error:', error);

    return {
      success: false,
      message: error.message || 'Failed to delete record',
    };
  }
}

export async function updateRecord(tool_id, data) {
  try {
    const { category, url_id, urlName, route, des, keyword, metaData } = data;
    const [result] = await ddb.query(
      `
      UPDATE ??
      SET url_id=?, urlName=?, route=?, des=?, keyword=?, metadata=?
      WHERE url_id=?
      `,
      [category, url_id, urlName, route, des, keyword, metaData, tool_id]
    );

    if (!result || result.affectedRows === 0) {
      return {
        success: false,
        message: 'Record not found',
      };
    }

    return {
      success: true,
      message: 'Record updated successfully',
    };
  } catch (error) {
    console.error('Update error:', error);

    return {
      success: false,
      message: error.message || 'Failed to update record',
    };
  }
}

export async function Login(username, password) {
  try {
    const [rows] = await ddb.query('SELECT id, username FROM users WHERE username = ?', [username]);

    if (!rows || rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    const user = rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
      },
      'token',
      { expiresIn: '1d' }
    );

    // ✅ Next.js 15+
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return {
      success: true,
      message: 'Login successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Login failed',
    };
  }
}

export async function userlogout() {
  try {
    const cookieStore = await cookies(); // ✅ Next 15 requires await
    cookieStore.delete('token'); // ✅ deletes cookie properly

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Logout failed',
    };
  }
}
export async function subscribe(email) {
  try {
    const [rows] = await ddb.query(
      `
      INSERT INTO subscribe
      (email_id)
      VALUES (?)
      `,
      [email]
    );

    if (!rows || rows.length === 0) {
      return { success: false, message: 'Invalid credentials' };
    }

    return {
      success: true,
      message: 'Subscription successful',
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Subscription failed',
    };
  }
}
